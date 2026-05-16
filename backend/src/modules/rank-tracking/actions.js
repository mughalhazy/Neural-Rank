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

  if (insight.type === "quick_win_positions") {
    return {
      type: "push_page2_rankings",
      keyword: null,
      title: "Push page 2 rankings to page 1",
      action: `${insight.keywords?.length || 0} keyword(s) sit on page 2. Strengthen internal linking to their pages, refresh content depth, and build 2-3 targeted backlinks to move into page 1.`,
      priority: "high",
      keywords: insight.keywords || [],
    };
  }

  if (insight.type === "ctr_underperformance") {
    return {
      type: "optimise_titles_for_ctr",
      keyword: insight.keyword,
      title: "Optimise title tags and meta descriptions for CTR",
      action: `${insight.keywords?.length || 0} keyword(s) are ranking but underperforming on clicks. Rewrite title tags to be more compelling, add power words, include numbers, and ensure the meta description contains a clear call to action.`,
      priority: "medium",
      keywords: insight.keywords || [],
    };
  }

  if (insight.type === "featured_snippet_positions") {
    return {
      type: "protect_featured_snippets",
      keyword: insight.keyword,
      title: "Protect featured snippet positions",
      action: "Monitor position 0 keywords closely. Keep the featured content stable — avoid restructuring the answer format. Add FAQ schema to reinforce eligibility.",
      priority: "low",
      keywords: insight.keywords || [],
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
