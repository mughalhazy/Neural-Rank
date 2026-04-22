function toPriority(issueCount) {
  if (issueCount >= 3) {
    return "high";
  }

  if (issueCount >= 2) {
    return "medium";
  }

  return "low";
}

function buildSuggestionAction(finding) {
  const issueTypes = new Set(finding.issues);
  let action = "Refine the asset messaging so it is clearer and more actionable.";

  if (issueTypes.has("theme_alignment_missing")) {
    action = "Rewrite the asset so target themes are explicitly reflected in the messaging.";
  } else if (issueTypes.has("cta_missing")) {
    action = "Add a clear call to action so the asset drives a concrete next step.";
  } else if (issueTypes.has("message_depth_thin")) {
    action = "Expand the asset body so the message explains more meaningful value.";
  } else if (issueTypes.has("headline_missing")) {
    action = "Add a clearer headline so the asset communicates its message immediately.";
  }

  return {
    type: "messaging_suggestion_action",
    priority: toPriority(finding.issues.length),
    assetRef: finding.assetRef,
    action,
    evidence: {
      issues: finding.issues,
      matchedThemes: finding.matchedThemes,
    },
  };
}

function buildBaselineAction(summary) {
  return {
    type: "messaging_monitoring_action",
    priority: summary.assetsNeedingWork > 0 ? "medium" : "low",
    action:
      summary.assetsNeedingWork > 0
        ? "Re-run messaging critique after copy revisions to confirm issue reduction."
        : "Preserve messaging baselines so future copy drift can be detected.",
    evidence: summary,
  };
}

function generateCreativeMessagingActions(analysisResult) {
  const actions = analysisResult.assetFindings
    .filter((finding) => finding.issues.length > 0)
    .sort((left, right) => right.issues.length - left.issues.length)
    .slice(0, 3)
    .map(buildSuggestionAction);

  actions.push(buildBaselineAction(analysisResult.summary));
  return actions;
}

module.exports = {
  generateCreativeMessagingActions,
};
