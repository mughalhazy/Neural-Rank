const MODULE_KEY = "review_analysis";
const { normalizeProductTarget } = require("../../core/targeting");

const CLUSTER_DEFINITIONS = Object.freeze([
  {
    clusterKey: "performance",
    label: "Performance",
    keywords: ["slow", "lag", "loading", "performance", "delay", "speed"],
  },
  {
    clusterKey: "stability",
    label: "Stability",
    keywords: ["crash", "crashes", "bug", "bugs", "error", "freeze", "broken", "issue"],
  },
  {
    clusterKey: "ux",
    label: "UX",
    keywords: ["confusing", "navigation", "ui", "ux", "difficult", "hard to use", "design"],
  },
  {
    clusterKey: "billing",
    label: "Billing",
    keywords: ["billing", "subscription", "price", "pricing", "refund", "paid", "cost"],
  },
  {
    clusterKey: "support",
    label: "Support",
    keywords: ["support", "help", "response", "customer service", "service"],
  },
]);

const VALID_REVIEW_SOURCES = new Set([
  "app_store", "play_store", "google_business", "trustpilot",
  "g2", "capterra", "yelp", "amazon", "direct_input", "other",
]);

const FEATURE_REQUEST_MARKERS = Object.freeze([
  "please add",
  "please include",
  "would like",
  "wish",
  "need",
  "could you add",
  "it would be great",
  "feature request",
]);

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function toNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizeReviewInput(reviewInput, index) {
  if (typeof reviewInput === "string") {
    const text = normalizeText(reviewInput);

    if (!text) {
      return null;
    }

    return {
      reviewId: `review_${index + 1}`,
      text,
      rating: null,
      source: "direct_input",
    };
  }

  if (!reviewInput || typeof reviewInput !== "object") {
    return null;
  }

  const text = normalizeText(
    reviewInput.text ?? reviewInput.content ?? reviewInput.review ?? "",
  );

  if (!text) {
    return null;
  }

  const rawSource = normalizeText(reviewInput.source).toLowerCase();
  const normalizedSource = VALID_REVIEW_SOURCES.has(rawSource) ? rawSource : "direct_input";

  const rawDate = reviewInput.date ?? reviewInput.reviewDate ?? reviewInput.created_at ?? null;
  const reviewDate = rawDate ? new Date(rawDate) : null;
  const reviewDateValid = reviewDate && !isNaN(reviewDate.getTime());

  return {
    reviewId:
      normalizeText(reviewInput.reviewId) ||
      normalizeText(reviewInput.id) ||
      `review_${index + 1}`,
    text,
    rating: toNumber(reviewInput.rating, null),
    source: normalizedSource,
    verifiedBuyer: Boolean(reviewInput.verifiedBuyer ?? reviewInput.verified_buyer ?? reviewInput.verified),
    responseReceived: Boolean(reviewInput.responseReceived ?? reviewInput.response_received ?? reviewInput.replied),
    reviewDate: reviewDateValid ? reviewDate.toISOString() : null,
  };
}

function normalizeReviews(reviewInputs = []) {
  return (Array.isArray(reviewInputs) ? reviewInputs : [])
    .map((reviewInput, index) => normalizeReviewInput(reviewInput, index))
    .filter(Boolean);
}

function calculateSeverityScore(review) {
  let score = 0;
  const lowerText = review.text.toLowerCase();

  if (review.rating !== null && review.rating <= 2) {
    score += 3;
  } else if (review.rating !== null && review.rating === 3) {
    score += 1;
  }

  if (
    lowerText.includes("crash") ||
    lowerText.includes("broken") ||
    lowerText.includes("not working") ||
    lowerText.includes("can not")
  ) {
    score += 2;
  }

  if (
    lowerText.includes("slow") ||
    lowerText.includes("lag") ||
    lowerText.includes("delay")
  ) {
    score += 1;
  }

  return score;
}

function getMatchedClusters(review) {
  const lowerText = review.text.toLowerCase();

  return CLUSTER_DEFINITIONS.filter((definition) =>
    definition.keywords.some((keyword) => lowerText.includes(keyword)),
  );
}

function buildComplaintClusters(reviews) {
  const clusterMap = new Map(
    CLUSTER_DEFINITIONS.map((definition) => [
      definition.clusterKey,
      {
        clusterKey: definition.clusterKey,
        label: definition.label,
        evidenceCount: 0,
        severityScore: 0,
        reviewIds: [],
        sampleReviews: [],
      },
    ]),
  );

  for (const review of reviews) {
    const matchedClusters = getMatchedClusters(review);

    for (const definition of matchedClusters) {
      const cluster = clusterMap.get(definition.clusterKey);
      cluster.evidenceCount += 1;
      cluster.severityScore += calculateSeverityScore(review);
      cluster.reviewIds.push(review.reviewId);

      if (cluster.sampleReviews.length < 3) {
        cluster.sampleReviews.push(review.text);
      }
    }
  }

  return [...clusterMap.values()]
    .filter((cluster) => cluster.evidenceCount > 0)
    .sort(
      (left, right) =>
        right.severityScore - left.severityScore ||
        right.evidenceCount - left.evidenceCount,
    );
}

function buildFeatureRequests(reviews) {
  return reviews
    .filter((review) => {
      const lowerText = review.text.toLowerCase();
      return FEATURE_REQUEST_MARKERS.some((marker) => lowerText.includes(marker));
    })
    .map((review) => ({
      reviewId: review.reviewId,
      requestSummary: review.text,
      severityScore: calculateSeverityScore(review),
    }));
}

function buildRecencyBuckets(reviews) {
  const now = Date.now();
  const d30 = 30 * 24 * 60 * 60 * 1000;
  const d90 = 90 * 24 * 60 * 60 * 1000;

  let recent = 0, midTerm = 0, older = 0, undated = 0;
  for (const review of reviews) {
    if (!review.reviewDate) { undated++; continue; }
    const age = now - new Date(review.reviewDate).getTime();
    if (age <= d30) recent++;
    else if (age <= d90) midTerm++;
    else older++;
  }
  return { last30Days: recent, last30To90Days: midTerm, olderThan90Days: older, undated };
}

function buildSummary(reviews, complaintClusters, featureRequests) {
  const ratedReviews = reviews.filter((review) => review.rating !== null);
  const averageRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce((total, review) => total + review.rating, 0) / ratedReviews.length
      : null;

  const verifiedCount = reviews.filter((r) => r.verifiedBuyer).length;
  const verifiedBuyerRatio = reviews.length > 0
    ? Math.round((verifiedCount / reviews.length) * 100) / 100
    : 0;

  const respondedCount = reviews.filter((r) => r.responseReceived).length;
  const responseRate = reviews.length > 0
    ? Math.round((respondedCount / reviews.length) * 100) / 100
    : 0;

  const sourceCounts = reviews.reduce((acc, r) => {
    acc[r.source] = (acc[r.source] || 0) + 1;
    return acc;
  }, {});

  const recencyBuckets = buildRecencyBuckets(reviews);

  return {
    reviewCount: reviews.length,
    averageRating,
    complaintClusterCount: complaintClusters.length,
    featureRequestCount: featureRequests.length,
    highestSeverityClusterKey: complaintClusters[0]?.clusterKey || null,
    verifiedBuyerRatio,
    responseRate,
    sourceCounts,
    recencyBuckets,
  };
}

function analyzeReviews(reviews) {
  const complaintClusters = buildComplaintClusters(reviews);
  const featureRequests = buildFeatureRequests(reviews);
  const summary = buildSummary(reviews, complaintClusters, featureRequests);

  return {
    reviewCount: reviews.length,
    complaintClusters,
    featureRequests,
    summary,
  };
}

function normalizeReviewAnalysisInput(moduleInput = {}, adapterResult = {}) {
  const directReviews = normalizeReviews(moduleInput.reviews);
  const adaptedReviews = normalizeReviews(
    adapterResult?.normalizedPayload?.reviews || adapterResult?.reviews || [],
  );
  const reviews = directReviews.length > 0 ? directReviews : adaptedReviews;

  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(moduleInput),
    reviews,
  };
}

function analyzeReviewLandscape(moduleInput = {}, adapterResult = {}) {
  const normalizedInput = normalizeReviewAnalysisInput(moduleInput, adapterResult);
  const analysis = analyzeReviews(normalizedInput.reviews);

  return {
    normalizedInput,
    ...analysis,
  };
}

module.exports = {
  MODULE_KEY,
  analyzeReviewLandscape,
  analyzeReviews,
  normalizeReviewAnalysisInput,
  normalizeReviews,
};
