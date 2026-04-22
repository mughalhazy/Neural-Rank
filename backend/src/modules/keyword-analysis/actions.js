function toPriority(score) {
  if (score >= 10) {
    return "high";
  }

  if (score >= 4) {
    return "medium";
  }

  return "low";
}

function createActionFromInsight(insight) {
  if (insight.type === "high_opportunity_keywords") {
    return {
      type: "prioritize_high_opportunity_keywords",
      title: "Prioritize highest-opportunity keyword candidates",
      action: insight.summary,
      priority: toPriority(insight.evidenceCount + insight.severityScore),
      keywords: insight.keywords || [],
    };
  }

  if (insight.type === "keyword_summary") {
    return {
      type: "keyword_analysis_follow_up",
      title: "Maintain keyword analysis follow-up",
      action: "Re-run keyword analysis after optimization work to confirm opportunity movement.",
      priority: "low",
      keywords: [],
    };
  }

  return {
    type: "review_keyword_expansion_set",
    title: "Review the expanded keyword opportunity set",
    action: insight.summary,
    priority: toPriority(insight.evidenceCount + insight.severityScore),
    keywords: [],
  };
}

function prioritizeKeywordActions(insightsPayload) {
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
    priority: action.priority,
    title: action.title,
    keywords: action.keywords,
  }));

  return {
    priorityPayload,
    actionsPayload,
  };
}

module.exports = {
  prioritizeKeywordActions,
};
