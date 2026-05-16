const MODULE_KEY = "competitor_analysis";
const { normalizeProductTarget } = require("../../core/targeting");
const { authorityGapSeverity } = require("../../core/domainAuthorityScorer");

function toNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizeCompetitor(input, index) {
  const competitorRef =
    input?.competitorRef ||
    input?.name ||
    input?.domain ||
    input?.appId ||
    `competitor_${index + 1}`;

  return {
    competitorRef,
    sourceType: input?.sourceType || "unspecified",
    keywordCoverageScore: toNumber(input?.keywordCoverageScore, 0),
    contentCoverageScore: toNumber(input?.contentCoverageScore, 0),
    rankVisibilityScore: toNumber(input?.rankVisibilityScore, 0),
    reviewSignalScore: toNumber(input?.reviewSignalScore, 0),
    domainAuthority: toNumber(input?.domainAuthority ?? input?.da, 0),
    topicCount: toNumber(input?.topicCount ?? input?.topic_count, 0),
    serpOverlapScore: toNumber(input?.serpOverlapScore ?? input?.serp_overlap, null),
    contentVelocity: toNumber(input?.contentVelocity ?? input?.content_velocity, null),
    notes: Array.isArray(input?.notes)
      ? input.notes.filter(Boolean)
      : input?.notes
        ? [String(input.notes)]
        : [],
  };
}

function normalizeInput(moduleInput = {}, adapterResult = {}) {
  const directCompetitors = Array.isArray(moduleInput.competitors)
    ? moduleInput.competitors
    : [];
  const adaptedCompetitors = Array.isArray(adapterResult.competitors)
    ? adapterResult.competitors
    : [];
  const competitors = (directCompetitors.length > 0
    ? directCompetitors
    : adaptedCompetitors
  ).map(normalizeCompetitor);

  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(moduleInput),
    comparisonBasis: {
      targetKeywordCoverageScore: toNumber(
        moduleInput?.targetKeywordCoverageScore,
        0,
      ),
      targetContentCoverageScore: toNumber(
        moduleInput?.targetContentCoverageScore,
        0,
      ),
      targetRankVisibilityScore: toNumber(
        moduleInput?.targetRankVisibilityScore,
        0,
      ),
      targetReviewSignalScore: toNumber(
        moduleInput?.targetReviewSignalScore,
        0,
      ),
      targetDomainAuthority: toNumber(moduleInput?.targetDomainAuthority ?? moduleInput?.targetDA, 0),
      targetTopicCount: toNumber(moduleInput?.targetTopicCount, 0),
    },
    competitors,
  };
}

function identifyGaps(normalizedInput) {
  const { competitors, comparisonBasis } = normalizedInput;

  return competitors.map((competitor) => {
    const keywordGap =
      competitor.keywordCoverageScore -
      comparisonBasis.targetKeywordCoverageScore;
    const contentGap =
      competitor.contentCoverageScore -
      comparisonBasis.targetContentCoverageScore;
    const rankGap =
      competitor.rankVisibilityScore -
      comparisonBasis.targetRankVisibilityScore;
    const reviewGap =
      competitor.reviewSignalScore -
      comparisonBasis.targetReviewSignalScore;
    const daGap = competitor.domainAuthority > 0 && comparisonBasis.targetDomainAuthority > 0
      ? competitor.domainAuthority - comparisonBasis.targetDomainAuthority
      : 0;
    const topicalGap = competitor.topicCount > 0 && comparisonBasis.targetTopicCount > 0
      ? competitor.topicCount - comparisonBasis.targetTopicCount
      : 0;

    const pressureScore = keywordGap + contentGap + rankGap + reviewGap + daGap + topicalGap;
    const strongestGapDimension = [
      { dimension: "keyword_coverage", value: keywordGap },
      { dimension: "content_coverage", value: contentGap },
      { dimension: "rank_visibility", value: rankGap },
      { dimension: "review_signal", value: reviewGap },
      { dimension: "domain_authority", value: daGap },
      { dimension: "topical_coverage", value: topicalGap },
    ].sort((left, right) => right.value - left.value)[0];

    const daSeverity = daGap > 0
      ? authorityGapSeverity(comparisonBasis.targetDomainAuthority, competitor.domainAuthority)
      : null;

    return {
      competitorRef: competitor.competitorRef,
      competitor,
      keywordGap,
      contentGap,
      rankGap,
      reviewGap,
      daGap,
      topicalGap,
      daSeverity,
      serpOverlapScore: competitor.serpOverlapScore,
      contentVelocity: competitor.contentVelocity,
      pressureScore,
      strongestGapDimension,
      gapDetected: pressureScore > 0,
    };
  });
}

function buildSummary(gapFindings) {
  const pressuredFindings = gapFindings.filter((item) => item.gapDetected);
  const topPressure = [...pressuredFindings].sort(
    (left, right) => right.pressureScore - left.pressureScore,
  )[0] || null;

  return {
    competitorCount: gapFindings.length,
    pressuredCompetitorCount: pressuredFindings.length,
    topPressureCompetitorRef: topPressure?.competitorRef || null,
  };
}

function analyzeCompetitorLandscape(moduleInput = {}, adapterResult = {}) {
  const normalizedInput = normalizeInput(moduleInput, adapterResult);
  const gapFindings = identifyGaps(normalizedInput);
  const summary = buildSummary(gapFindings);

  return {
    normalizedInput,
    gapFindings,
    summary,
  };
}

module.exports = {
  MODULE_KEY,
  analyzeCompetitorLandscape,
};
