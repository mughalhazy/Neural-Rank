const { normalizeProductTarget } = require("../../core/targeting");

const MODULE_KEY = "local_seo";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCitation(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    source: normalizeText(raw.source ?? raw.directory ?? ""),
    name: normalizeText(raw.name ?? ""),
    address: normalizeText(raw.address ?? ""),
    phone: normalizeText(raw.phone ?? ""),
  };
}

function normalizeLocalKeyword(raw) {
  if (!raw || typeof raw !== "object") return null;
  const keyword = normalizeText(raw.keyword ?? raw.term ?? "").toLowerCase();
  if (!keyword) return null;
  return {
    keyword,
    localPackPosition: toNumber(raw.localPackPosition ?? raw.pack_position, null),
    organicPosition: toNumber(raw.organicPosition ?? raw.position, null),
  };
}

function normalizeLocalSeoInput(inputPayload = {}) {
  const gbp = inputPayload.googleBusinessProfile ?? inputPayload.gbp ?? {};
  const reviewSignals = inputPayload.reviewSignals ?? inputPayload.reviews ?? {};

  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(inputPayload),
    businessName: normalizeText(inputPayload.businessName ?? inputPayload.business_name ?? ""),
    address: normalizeText(inputPayload.address ?? ""),
    phone: normalizeText(inputPayload.phone ?? ""),
    website: normalizeText(inputPayload.website ?? ""),
    googleBusinessProfile: {
      categorySet: Boolean(gbp.categorySet ?? gbp.category_set ?? gbp.categories),
      hoursComplete: Boolean(gbp.hoursComplete ?? gbp.hours_complete ?? gbp.hours),
      photosCount: toNumber(gbp.photosCount ?? gbp.photos_count ?? gbp.photos, 0),
      postsCount: toNumber(gbp.postsCount ?? gbp.posts_count ?? gbp.posts, 0),
      qaCount: toNumber(gbp.qaCount ?? gbp.qa_count ?? gbp.qa, 0),
      descriptionPresent: Boolean(gbp.descriptionPresent ?? gbp.description),
      attributesCount: toNumber(gbp.attributesCount ?? gbp.attributes_count, 0),
      productsComplete: Boolean(gbp.productsComplete ?? gbp.products),
    },
    citations: Array.isArray(inputPayload.citations)
      ? inputPayload.citations.map(normalizeCitation).filter(Boolean)
      : [],
    localKeywords: Array.isArray(inputPayload.localKeywords)
      ? inputPayload.localKeywords.map(normalizeLocalKeyword).filter(Boolean)
      : [],
    reviewSignals: {
      totalReviews: toNumber(reviewSignals.totalReviews ?? reviewSignals.total, 0),
      averageRating: toNumber(reviewSignals.averageRating ?? reviewSignals.rating, null),
      monthlyVelocity: toNumber(reviewSignals.monthlyVelocity ?? reviewSignals.velocity, 0),
      responseRate: toNumber(reviewSignals.responseRate ?? reviewSignals.response_rate, 0),
    },
  };
}

function scoreGbp(gbp) {
  let score = 0;
  if (gbp.categorySet) score += 10;
  if (gbp.hoursComplete) score += 8;
  if (gbp.photosCount >= 10) score += 7;
  else if (gbp.photosCount >= 3) score += 4;
  if (gbp.descriptionPresent) score += 5;
  if (gbp.postsCount >= 1) score += 5;
  if (gbp.productsComplete) score += 5;

  const issues = [];
  if (!gbp.categorySet) issues.push("gbp_missing_category");
  if (!gbp.hoursComplete) issues.push("gbp_hours_incomplete");
  if (gbp.photosCount < 3) issues.push("gbp_insufficient_photos");
  if (!gbp.descriptionPresent) issues.push("gbp_missing_description");
  if (gbp.postsCount === 0) issues.push("gbp_no_recent_posts");

  return { gbpScore: Math.min(40, score), issues };
}

function scoreNapConsistency(businessName, address, phone, citations) {
  if (citations.length === 0) return { napScore: 10, napConsistencyRatio: 1, napMatches: 0, napIssues: [] };

  const targetName = businessName.toLowerCase();
  const targetAddress = address.toLowerCase();
  const targetPhone = phone.replace(/\D/g, "");

  const napIssues = [];
  let matches = 0;

  for (const citation of citations) {
    const nameMatch = citation.name.toLowerCase().includes(targetName) || targetName.includes(citation.name.toLowerCase());
    const addressMatch = !address || citation.address.toLowerCase().includes(targetAddress.split(",")[0]) || targetAddress.includes(citation.address.toLowerCase().split(",")[0]);
    const phoneMatch = !phone || citation.phone.replace(/\D/g, "") === targetPhone;

    if (nameMatch && addressMatch && phoneMatch) {
      matches++;
    } else {
      if (!nameMatch) napIssues.push(`Name mismatch at ${citation.source}`);
      if (!phoneMatch && phone) napIssues.push(`Phone mismatch at ${citation.source}`);
    }
  }

  const napConsistencyRatio = matches / citations.length;
  const napScore = Math.round(napConsistencyRatio * 20);

  return { napScore, napConsistencyRatio: Math.round(napConsistencyRatio * 100) / 100, napMatches: matches, napIssues: napIssues.slice(0, 5) };
}

function scoreLocalVisibility(localKeywords) {
  if (localKeywords.length === 0) return { visibilityScore: 0, localPackCount: 0, avgPackPosition: null };

  const inPack = localKeywords.filter(
    (k) => k.localPackPosition !== null && k.localPackPosition <= 3,
  );
  const localPackRatio = inPack.length / localKeywords.length;
  const packPositions = localKeywords
    .filter((k) => k.localPackPosition !== null)
    .map((k) => k.localPackPosition);
  const avgPackPosition = packPositions.length > 0
    ? Math.round(packPositions.reduce((s, p) => s + p, 0) / packPositions.length * 10) / 10
    : null;

  return {
    visibilityScore: Math.round(localPackRatio * 25),
    localPackCount: inPack.length,
    avgPackPosition,
    totalLocalKeywords: localKeywords.length,
  };
}

function scoreReviews(reviewSignals) {
  const { averageRating, monthlyVelocity, responseRate } = reviewSignals;
  const ratingScore = averageRating === null ? 4
    : averageRating >= 4.5 ? 8
    : averageRating >= 4.0 ? 5
    : 2;
  const velocityScore = monthlyVelocity >= 5 ? 4 : monthlyVelocity >= 2 ? 2 : 0;
  const responseScore = responseRate >= 0.8 ? 3 : responseRate >= 0.5 ? 1 : 0;
  const reviewScore = ratingScore + velocityScore + responseScore;

  const issues = [];
  if (averageRating !== null && averageRating < 4.0) issues.push("low_average_rating");
  if (monthlyVelocity < 2) issues.push("slow_review_velocity");
  if (responseRate < 0.5) issues.push("low_response_rate");

  return { reviewScore: Math.min(15, reviewScore), issues };
}

function analyzeLocalSeo(normalizedInput) {
  const { businessName, address, phone, googleBusinessProfile: gbp, citations, localKeywords, reviewSignals } = normalizedInput;

  const gbpResult = scoreGbp(gbp);
  const napResult = scoreNapConsistency(businessName, address, phone, citations);
  const visibilityResult = scoreLocalVisibility(localKeywords);
  const reviewResult = scoreReviews(reviewSignals);

  const overallLocalScore = gbpResult.gbpScore + napResult.napScore + visibilityResult.visibilityScore + reviewResult.reviewScore;
  const scoreBand = overallLocalScore >= 70 ? "strong" : overallLocalScore >= 40 ? "moderate" : "weak";

  return {
    normalizedInput,
    gbpAnalysis: { ...gbpResult, gbp },
    napAnalysis: { ...napResult, citationCount: citations.length },
    visibilityAnalysis: visibilityResult,
    reviewAnalysis: { ...reviewResult, reviewSignals },
    overallLocalScore,
    scoreBand,
  };
}

module.exports = {
  MODULE_KEY,
  analyzeLocalSeo,
  normalizeLocalSeoInput,
};
