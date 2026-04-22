function toPriority(issueCount) {
  if (issueCount >= 3) {
    return "high";
  }

  if (issueCount >= 2) {
    return "medium";
  }

  return "low";
}

function buildImprovementAction(finding) {
  const issueTypes = new Set(finding.issues);
  let action = "Refine the section to improve optimization quality.";

  if (issueTypes.has("keyword_coverage_missing")) {
    action = "Expand section keyword coverage using the tracked target terms.";
  } else if (issueTypes.has("metadata_incomplete")) {
    action = "Complete the missing metadata for the section before further optimization work.";
  } else if (issueTypes.has("content_thin")) {
    action = "Expand thin section content so the section carries clearer optimization value.";
  }

  return {
    type: "optimization_improvement_action",
    priority: toPriority(finding.issues.length),
    sectionRef: finding.sectionRef,
    action,
    evidence: {
      issues: finding.issues,
      missingKeywordCount: finding.missingKeywordCount,
    },
  };
}

function buildBaselineAction(summary) {
  return {
    type: "optimization_monitoring_action",
    priority: summary.sectionsNeedingOptimization > 0 ? "medium" : "low",
    action:
      summary.sectionsNeedingOptimization > 0
        ? "Re-run optimization analysis after content and metadata changes to confirm gap reduction."
        : "Preserve optimization baselines so future regressions can be detected.",
    evidence: summary,
  };
}

function generateOptimizationActions(analysisResult) {
  const actions = analysisResult.sectionFindings
    .filter((finding) => finding.issues.length > 0)
    .sort((left, right) => right.issues.length - left.issues.length)
    .slice(0, 3)
    .map(buildImprovementAction);

  actions.push(buildBaselineAction(analysisResult.summary));
  return actions;
}

module.exports = {
  generateOptimizationActions,
};
