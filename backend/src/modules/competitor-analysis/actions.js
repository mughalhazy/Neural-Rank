function toPriority(score) {
  if (score >= 25) {
    return "high";
  }

  if (score >= 10) {
    return "medium";
  }

  return "low";
}

const DIMENSION_ACTIONS = {
  keyword_coverage: "Close keyword coverage gaps against the leading competitor signal set.",
  content_coverage: "Improve listing/content coverage where competitors present broader or clearer value signals.",
  rank_visibility: "Address ranking weakness on the terms where competitor visibility is stronger.",
  review_signal: "Address review-driven competitive pressure reflected in stronger external signals.",
  domain_authority: "Build domain authority through high-DA backlink acquisition to close the authority gap.",
  topical_coverage: "Expand topical coverage by creating content on subjects competitors rank for but the target does not.",
};

function buildGapAction(finding) {
  return {
    type: "competitive_gap_action",
    priority: toPriority(finding.pressureScore),
    competitorRef: finding.competitorRef,
    action: DIMENSION_ACTIONS[finding.strongestGapDimension.dimension] ||
      "Address the strongest competitive gap dimension identified in the analysis.",
    evidence: {
      pressureScore: finding.pressureScore,
      strongestGapDimension: finding.strongestGapDimension.dimension,
      daGap: finding.daGap,
      topicalGap: finding.topicalGap,
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
  const pressuredFindings = analysisResult.gapFindings
    .filter((finding) => finding.gapDetected)
    .sort((left, right) => right.pressureScore - left.pressureScore);

  const pressureActions = pressuredFindings.slice(0, 3).map(buildGapAction);

  const highDaGapFinding = pressuredFindings.find((f) => f.daGap > 15);
  if (highDaGapFinding) {
    pressureActions.push({
      type: "close_domain_authority_gap",
      priority: highDaGapFinding.daSeverity === "critical" ? "high" : "medium",
      competitorRef: highDaGapFinding.competitorRef,
      action: `Close the domain authority gap of ${highDaGapFinding.daGap} points vs ${highDaGapFinding.competitorRef}. Focus on high-DA link acquisition and toxic link removal.`,
      evidence: { daGap: highDaGapFinding.daGap, daSeverity: highDaGapFinding.daSeverity },
    });
  }

  const highTopicalFinding = pressuredFindings.find((f) => f.topicalGap > 10);
  if (highTopicalFinding) {
    pressureActions.push({
      type: "close_topical_coverage_gap",
      priority: "medium",
      competitorRef: highTopicalFinding.competitorRef,
      action: `${highTopicalFinding.competitorRef} covers ${highTopicalFinding.topicalGap} more topics. Build a content calendar targeting the uncovered topic cluster to regain topical parity.`,
      evidence: { topicalGap: highTopicalFinding.topicalGap },
    });
  }

  pressureActions.push(buildMonitoringAction(analysisResult.summary));

  return pressureActions;
}

module.exports = {
  generateCompetitorActions,
};
