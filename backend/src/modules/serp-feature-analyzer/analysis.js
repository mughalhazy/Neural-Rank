const { normalizeProductTarget } = require("../../core/targeting");

const MODULE_KEY = "serp_feature_analyzer";

const FEATURE_CTR_IMPACT = Object.freeze({
  featured_snippet: { ctrBoost: 8,  positionEquivalent: 0 },
  knowledge_panel:  { ctrBoost: 5,  positionEquivalent: 1 },
  local_pack:       { ctrBoost: 15, positionEquivalent: 0 },
  image_carousel:   { ctrBoost: 3,  positionEquivalent: 2 },
  video_carousel:   { ctrBoost: 4,  positionEquivalent: 2 },
  people_also_ask:  { ctrBoost: 2,  positionEquivalent: 3 },
  sitelinks:        { ctrBoost: 10, positionEquivalent: 1 },
});

const ELIGIBILITY_REQUIREMENTS = Object.freeze({
  featured_snippet: ["structured Q&A content", "definition paragraphs", "step-by-step lists", "comparison tables"],
  local_pack:       ["Google Business Profile", "local NAP signals", "local keyword targeting"],
  people_also_ask:  ["FAQ schema markup", "question-format headings", "concise direct answers"],
  image_carousel:   ["optimised images with descriptive filenames", "image schema markup", "descriptive alt text"],
  video_carousel:   ["YouTube video published", "VideoObject schema markup"],
  sitelinks:        ["strong brand recognition", "clear site structure", "high brand search volume"],
  knowledge_panel:  ["Wikipedia presence or Wikidata entity", "consistent brand mentions across the web"],
});

const ALL_FEATURE_KEYS = Object.keys(FEATURE_CTR_IMPACT);

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeKeywordSerpEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const keyword = String(raw.keyword ?? raw.term ?? raw.query ?? "").toLowerCase().trim();
  if (!keyword) return null;

  const featuresPresent = toArray(raw.featuresPresent ?? raw.features_present ?? raw.serpFeatures)
    .map((f) => String(f).toLowerCase().trim())
    .filter((f) => ALL_FEATURE_KEYS.includes(f));

  const featuresOwned = toArray(raw.featuresOwned ?? raw.features_owned ?? raw.ownedFeatures)
    .map((f) => String(f).toLowerCase().trim())
    .filter((f) => ALL_FEATURE_KEYS.includes(f));

  return {
    keyword,
    url: String(raw.url ?? raw.rankingUrl ?? ""),
    currentPosition: Number(raw.position ?? raw.currentPosition) || null,
    featuresPresent,
    featuresOwned,
  };
}

function normalizeFeatureInput(inputPayload = {}) {
  const rawEntries = Array.isArray(inputPayload.serpEntries)
    ? inputPayload.serpEntries
    : Array.isArray(inputPayload.keywords)
      ? inputPayload.keywords
      : [];

  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(inputPayload),
    serpEntries: rawEntries.map(normalizeKeywordSerpEntry).filter(Boolean),
  };
}

function scoreEligibility(feature, _entry) {
  const reqs = ELIGIBILITY_REQUIREMENTS[feature] || [];
  return reqs.length > 0 ? Math.round((1 / reqs.length) * 50) : 30;
}

function analyzeKeywordFeatures(entry) {
  const ownedSet = new Set(entry.featuresOwned);
  const featureGaps = entry.featuresPresent.filter((f) => !ownedSet.has(f));

  const gapDetails = featureGaps.map((feature) => {
    const impact = FEATURE_CTR_IMPACT[feature];
    return {
      feature,
      ctrBoost: impact.ctrBoost,
      positionEquivalent: impact.positionEquivalent,
      eligibilityScore: scoreEligibility(feature, entry),
      requirements: ELIGIBILITY_REQUIREMENTS[feature] || [],
    };
  });

  const estimatedCtrLift = gapDetails.reduce((sum, g) => sum + g.ctrBoost, 0);
  const featureOwnershipRatio = entry.featuresPresent.length > 0
    ? Math.round((entry.featuresOwned.length / entry.featuresPresent.length) * 100)
    : 100;

  return {
    keyword: entry.keyword,
    url: entry.url,
    currentPosition: entry.currentPosition,
    featuresPresent: entry.featuresPresent,
    featuresOwned: entry.featuresOwned,
    featureGaps: gapDetails,
    estimatedCtrLift,
    featureOwnershipRatio,
  };
}

function analyzeFeatureOpportunities(normalizedInput) {
  const { serpEntries } = normalizedInput;

  if (serpEntries.length === 0) {
    return {
      normalizedInput,
      keywordAnalyses: [],
      totalFeatureGaps: 0,
      highValueGaps: [],
      totalEstimatedCtrLift: 0,
      topOpportunity: null,
      featureOwnershipRatioAvg: 100,
    };
  }

  const keywordAnalyses = serpEntries.map(analyzeKeywordFeatures);

  const totalFeatureGaps = keywordAnalyses.reduce((sum, k) => sum + k.featureGaps.length, 0);
  const totalEstimatedCtrLift = keywordAnalyses.reduce((sum, k) => sum + k.estimatedCtrLift, 0);

  const HIGH_VALUE_FEATURES = new Set(["featured_snippet", "local_pack", "sitelinks"]);
  const highValueGaps = keywordAnalyses
    .flatMap((k) => k.featureGaps.filter((g) => HIGH_VALUE_FEATURES.has(g.feature)).map((g) => ({ ...g, keyword: k.keyword })))
    .sort((a, b) => b.ctrBoost - a.ctrBoost);

  const allGaps = keywordAnalyses.flatMap((k) =>
    k.featureGaps.map((g) => ({ ...g, keyword: k.keyword })),
  ).sort((a, b) => b.ctrBoost - a.ctrBoost);

  const topOpportunity = allGaps[0] || null;

  const featureOwnershipRatioAvg = keywordAnalyses.length > 0
    ? Math.round(keywordAnalyses.reduce((s, k) => s + k.featureOwnershipRatio, 0) / keywordAnalyses.length)
    : 100;

  return {
    normalizedInput,
    keywordAnalyses,
    totalFeatureGaps,
    highValueGaps,
    allGaps,
    totalEstimatedCtrLift,
    topOpportunity,
    featureOwnershipRatioAvg,
  };
}

module.exports = {
  MODULE_KEY,
  FEATURE_CTR_IMPACT,
  ELIGIBILITY_REQUIREMENTS,
  analyzeFeatureOpportunities,
  normalizeFeatureInput,
};
