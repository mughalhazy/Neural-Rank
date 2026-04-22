const MODULE_KEY = "review_analysis";

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

  return {
    reviewId:
      normalizeText(reviewInput.reviewId) ||
      normalizeText(reviewInput.id) ||
      `review_${index + 1}`,
    text,
    rating: toNumber(reviewInput.rating, null),
    source: normalizeText(reviewInput.source) || "direct_input",
  };
}

function normalizeReviews(reviewInputs = []) {
  return (Array.isArray(reviewInputs) ? reviewInputs : [])
    .map((reviewInput, index) => normalizeReviewInput(reviewInput, index))
    .filter(Boolean);
}

function resolveProductTarget(moduleInput = {}) {
  return {
    targetRef:
      normalizeText(moduleInput.targetRef) ||
      normalizeText(moduleInput.websiteUrl) ||
      normalizeText(moduleInput.appUrl) ||
      normalizeText(moduleInput.appId) ||
      "unknown_target",
    targetType:
      normalizeText(moduleInput.targetType) ||
      (normalizeText(moduleInput.appUrl) || normalizeText(moduleInput.appId)
        ? "app_target"
        : "product_target"),
    websiteUrl: normalizeText(moduleInput.websiteUrl) || null,
    appId: normalizeText(moduleInput.appId) || null,
    appStoreUrl: normalizeText(moduleInput.appUrl) || normalizeText(moduleInput.appStoreUrl) || null,
    playStoreUrl: normalizeText(moduleInput.playStoreUrl) || null,
  };
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

function buildSummary(reviews, complaintClusters, featureRequests) {
  const ratedReviews = reviews.filter((review) => review.rating !== null);
  const averageRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce((total, review) => total + review.rating, 0) / ratedReviews.length
      : null;

  return {
    reviewCount: reviews.length,
    averageRating,
    complaintClusterCount: complaintClusters.length,
    featureRequestCount: featureRequests.length,
    highestSeverityClusterKey: complaintClusters[0]?.clusterKey || null,
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
    productTarget: resolveProductTarget(moduleInput),
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
