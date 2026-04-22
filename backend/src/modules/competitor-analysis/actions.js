function toPriority(score) {
  if (score >= 25) {
    return "high";
  }

  if (score >= 10) {
    return "medium";
  }

  return "low";
}

function buildGapAction(finding) {
  return {
    type: "competitive_gap_action",
    priority: toPriority(finding.pressureScore),
    competitorRef: finding.competitorRef,
    action:
      finding.strongestGapDimension.dimension === "keyword_coverage"
        ? "Close keyword coverage gaps against the leading competitor signal set."
        : finding.strongestGapDimension.dimension === "content_coverage"
          ? "Improve listing/content coverage where competitors present broader or clearer value signals."
          : finding.strongestGapDimension.dimension === "rank_visibility"
            ? "Address ranking weakness on the terms where competitor visibility is stronger."
            : "Address review-driven competitive pressure reflected in stronger external signals.",
    evidence: {
      pressureScore: finding.pressureScore,
      strongestGapDimension: finding.strongestGapDimension.dimension,
    },
  };
}

function buildMonitoringAction(summary) {
  return {
    type: "competitor_monitoring_action",
    priority: summary.pressuredCompetitorCount > 0 ? "medium" : "low",
    action:
      summary.pressuredCompetitorCount > 0
        ? "Keep competitor comparisons persistent so movement in pressure signals can be re-evaluated on the next run."
        : "Continue baseline competitor monitoring to preserve future comparison continuity.",
    evidence: summary,
  };
}

function generateCompetitorActions(analysisResult) {
  const pressureActions = analysisResult.gapFindings
    .filter((finding) => finding.gapDetected)
    .sort((left, right) => right.pressureScore - left.pressureScore)
    .slice(0, 3)
    .map(buildGapAction);

  pressureActions.push(buildMonitoringAction(analysisResult.summary));

  return pressureActions;
}

module.exports = {
  generateCompetitorActions,
};
