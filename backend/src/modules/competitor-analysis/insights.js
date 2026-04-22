function buildPressureInsight(finding) {
  return {
    type: "competitor_pressure",
    competitorRef: finding.competitorRef,
    severity: finding.pressureScore >= 25 ? "high" : "medium",
    message: `${finding.competitorRef} is outpacing the target across ${finding.strongestGapDimension.dimension}.`,
    evidence: {
      strongestGapDimension: finding.strongestGapDimension.dimension,
      pressureScore: finding.pressureScore,
      keywordGap: finding.keywordGap,
      contentGap: finding.contentGap,
      rankGap: finding.rankGap,
      reviewGap: finding.reviewGap,
    },
  };
}

function buildCoverageInsight(summary) {
  return {
    type: "coverage_summary",
    severity: summary.pressuredCompetitorCount > 0 ? "medium" : "low",
    message:
      summary.pressuredCompetitorCount > 0
        ? `${summary.pressuredCompetitorCount} competitors currently show stronger external signals than the target.`
        : "No competitor currently exceeds the target across the tracked comparison signals.",
    evidence: summary,
  };
}

function generateCompetitorInsights(analysisResult) {
  const pressuredFindings = analysisResult.gapFindings
    .filter((finding) => finding.gapDetected)
    .sort((left, right) => right.pressureScore - left.pressureScore);

  const insights = [];

  if (pressuredFindings[0]) {
    insights.push(buildPressureInsight(pressuredFindings[0]));
  }

  if (pressuredFindings[1]) {
    insights.push(buildPressureInsight(pressuredFindings[1]));
  }

  insights.push(buildCoverageInsight(analysisResult.summary));

  return insights;
}

module.exports = {
  generateCompetitorInsights,
};
