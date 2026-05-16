function createDeclineInsight(analysisResult) {
  if (!analysisResult.topDecline) {
    return null;
  }

  return {
    type: "rank_decline",
    severity: Math.abs(analysisResult.topDecline.delta) >= 10 ? "high" : "medium",
    keyword: analysisResult.topDecline.keyword,
    title: "A tracked keyword is losing rank position",
    summary: `${analysisResult.topDecline.keyword} moved from ${analysisResult.topDecline.previousPosition} to ${analysisResult.topDecline.currentPosition}.`,
    evidenceCount: analysisResult.declinedCount,
    severityScore: Math.abs(analysisResult.topDecline.delta),
  };
}

function createImprovementInsight(analysisResult) {
  if (!analysisResult.topImprovement) {
    return null;
  }

  return {
    type: "rank_improvement",
    severity: analysisResult.topImprovement.delta >= 10 ? "medium" : "low",
    keyword: analysisResult.topImprovement.keyword,
    title: "A tracked keyword is improving",
    summary: `${analysisResult.topImprovement.keyword} moved from ${analysisResult.topImprovement.previousPosition} to ${analysisResult.topImprovement.currentPosition}.`,
    evidenceCount: analysisResult.improvedCount,
    severityScore: analysisResult.topImprovement.delta,
  };
}

function createCoverageInsight(analysisResult) {
  return {
    type: "rank_tracking_coverage",
    severity: analysisResult.declinedCount > 0 ? "medium" : "low",
    title: "Rank movement summary is available",
    summary: `${analysisResult.rankEntryCount} tracked keyword positions were evaluated.`,
    evidenceCount: analysisResult.rankEntryCount,
    severityScore: analysisResult.declinedCount,
  };
}

function createQuickWinInsight(analysisResult) {
  const { quickWinKeywords = [] } = analysisResult;
  if (quickWinKeywords.length === 0) return null;
  return {
    type: "quick_win_positions",
    severity: "high",
    keyword: null,
    title: "Page 2 keywords need a targeted push",
    summary: `${quickWinKeywords.length} keyword(s) rank on page 2 (positions 11-20) — a small authority or content boost could deliver page 1 visibility.`,
    evidenceCount: quickWinKeywords.length,
    severityScore: quickWinKeywords.length * 3,
    keywords: quickWinKeywords.map((k) => k.keyword),
  };
}

function createCtrUnderperformanceInsight(analysisResult) {
  const { ctrUnderperformers = [] } = analysisResult;
  if (ctrUnderperformers.length === 0) return null;
  const worst = ctrUnderperformers.sort((a, b) => (a.ctrEfficiency || 0) - (b.ctrEfficiency || 0))[0];
  return {
    type: "ctr_underperformance",
    severity: "medium",
    keyword: worst.keyword,
    title: "Keywords ranking well but underperforming on CTR",
    summary: `${ctrUnderperformers.length} keyword(s) are receiving less than 70% of expected CTR for their rank position — title tags and meta descriptions likely need improvement.`,
    evidenceCount: ctrUnderperformers.length,
    severityScore: ctrUnderperformers.length * 2,
    keywords: ctrUnderperformers.map((k) => k.keyword),
  };
}

function createPositionZeroInsight(analysisResult) {
  const { positionZeroEntries = [] } = analysisResult;
  if (positionZeroEntries.length === 0) return null;
  return {
    type: "featured_snippet_positions",
    severity: "low",
    keyword: positionZeroEntries[0]?.keyword || null,
    title: "Featured snippet positions held",
    summary: `${positionZeroEntries.length} keyword(s) hold position 0 (featured snippet) — protect these with content stability and schema markup.`,
    evidenceCount: positionZeroEntries.length,
    severityScore: 1,
    keywords: positionZeroEntries.map((k) => k.keyword),
  };
}

function generateRankInsights(analysisResult) {
  return [
    createDeclineInsight(analysisResult),
    createQuickWinInsight(analysisResult),
    createCtrUnderperformanceInsight(analysisResult),
    createImprovementInsight(analysisResult),
    createPositionZeroInsight(analysisResult),
    createCoverageInsight(analysisResult),
  ].filter(Boolean);
}

module.exports = {
  generateRankInsights,
};
