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

function generateRankInsights(analysisResult) {
  return [
    createDeclineInsight(analysisResult),
    createImprovementInsight(analysisResult),
    createCoverageInsight(analysisResult),
  ].filter(Boolean);
}

module.exports = {
  generateRankInsights,
};
