function toPriority(score) {
  if (score >= 4) {
    return "high";
  }

  if (score >= 2) {
    return "medium";
  }

  return "low";
}

function createActionFromInsight(insight) {
  if (insight.surface === "combined") {
    return {
      type: "content_listing_follow_up",
      surface: insight.surface,
      priority: "low",
      title: "Maintain content and listing follow-up",
      action: "Re-run content and listing analysis after improvements to confirm structural gaps have been reduced.",
      evidence: {
        evidenceCount: insight.evidenceCount,
        severityScore: insight.severityScore,
      },
    };
  }

  const isListing = insight.surface === "app_listing";
  const priority = toPriority(insight.evidenceCount + insight.severityScore);

  return {
    type: isListing ? "improve_listing_quality" : "improve_content_quality",
    surface: insight.surface,
    priority,
    title:
      isListing
        ? "Prioritize app listing quality improvements"
        : "Prioritize website content quality improvements",
    action:
      insight.missingKeywords && insight.missingKeywords.length > 0
        ? `${insight.summary} Close keyword coverage gaps for: ${insight.missingKeywords.join(", ")}.`
        : insight.summary,
    evidence: {
      evidenceCount: insight.evidenceCount,
      severityScore: insight.severityScore,
      missingKeywords: insight.missingKeywords || [],
    },
  };
}

function prioritizeContentListingActions(insightsPayload) {
  const priorityRank = { high: 3, medium: 2, low: 1 };

  const actionsPayload = insightsPayload
    .map(createActionFromInsight)
    .sort(
      (left, right) =>
        priorityRank[right.priority] - priorityRank[left.priority] ||
        left.title.localeCompare(right.title),
    );

  const priorityPayload = actionsPayload.map((action) => ({
    type: action.type,
    surface: action.surface,
    priority: action.priority,
    title: action.title,
  }));

  return {
    priorityPayload,
    actionsPayload,
  };
}

module.exports = {
  prioritizeContentListingActions,
};
