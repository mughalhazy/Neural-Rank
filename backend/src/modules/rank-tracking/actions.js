function toPriority(score) {
  if (score >= 10) {
    return "high";
  }

  if (score >= 3) {
    return "medium";
  }

  return "low";
}

function createActionFromInsight(insight) {
  if (insight.type === "rank_decline") {
    return {
      type: "investigate_rank_decline",
      keyword: insight.keyword,
      title: "Prioritize response to ranking decline",
      action: insight.summary,
      priority: toPriority(insight.evidenceCount + insight.severityScore + 2),
    };
  }

  if (insight.type === "rank_improvement") {
    return {
      type: "reinforce_rank_improvement",
      keyword: insight.keyword,
      title: "Protect recent ranking gains",
      action: insight.summary,
      priority: toPriority(insight.evidenceCount + insight.severityScore),
    };
  }

  return {
    type: "review_rank_tracking_summary",
    keyword: null,
    title: "Review tracked keyword movement summary",
    action: insight.summary,
    priority: "low",
  };
}

function prioritizeRankActions(insightsPayload) {
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
    keyword: action.keyword,
    priority: action.priority,
    title: action.title,
  }));

  return {
    priorityPayload,
    actionsPayload,
  };
}

module.exports = {
  prioritizeRankActions,
};
