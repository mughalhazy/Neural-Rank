const MODULE_KEY = "competitor_analysis";

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
    productTarget: {
      targetRef:
        moduleInput?.targetRef ||
        moduleInput?.websiteUrl ||
        moduleInput?.appId ||
        moduleInput?.appStoreUrl ||
        moduleInput?.playStoreUrl ||
        "unknown_target",
      targetType: moduleInput?.targetType || "product_target",
      websiteUrl: moduleInput?.websiteUrl || null,
      appId: moduleInput?.appId || null,
      appStoreUrl: moduleInput?.appStoreUrl || null,
      playStoreUrl: moduleInput?.playStoreUrl || null,
    },
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

    const pressureScore = keywordGap + contentGap + rankGap + reviewGap;
    const strongestGapDimension = [
      { dimension: "keyword_coverage", value: keywordGap },
      { dimension: "content_coverage", value: contentGap },
      { dimension: "rank_visibility", value: rankGap },
      { dimension: "review_signal", value: reviewGap },
    ].sort((left, right) => right.value - left.value)[0];

    return {
      competitorRef: competitor.competitorRef,
      competitor,
      keywordGap,
      contentGap,
      rankGap,
      reviewGap,
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
