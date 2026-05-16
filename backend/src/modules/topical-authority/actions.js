function toPriority(score) {
  if (score >= 10) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function createActionFromInsight(insight) {
  switch (insight.type) {
    case "low_topical_coverage": {
      const topics = (insight.evidence.topics || []).slice(0, 5);
      return {
        type: "create_content_for_uncovered_topics",
        title: "Create content for uncovered core topics",
        action: `${insight.evidence.uncoveredCount} topic(s) have zero content. Start with the topics most frequently covered by competitors. For each: create a comprehensive pillar page (2000+ words) before building supporting cluster content.`,
        priority: "high",
        targetTopics: topics,
      };
    }

    case "missing_pillar_pages": {
      const topics = (insight.evidence.topics || []).slice(0, 5);
      return {
        type: "create_missing_pillar_pages",
        title: "Create pillar pages for topic clusters missing anchors",
        action: `${insight.evidence.count} topic cluster(s) have supporting content but no pillar page. Write a comprehensive 2000+ word definitive guide for each cluster, then internally link all supporting pieces to it.`,
        priority: "high",
        targetTopics: topics,
      };
    }

    case "competitor_topic_gaps":
      return {
        type: "fill_competitor_topic_gaps",
        title: "Fill topic gaps that competitors currently own",
        action: `${insight.evidence.gapCount} competitor-covered topic(s) are missing from the target's content library. Prioritise by how many competitors cover each gap — the most-covered gaps represent the highest-demand content opportunities.`,
        priority: toPriority(insight.severityScore + insight.evidenceCount),
        topGapTopic: insight.evidence.topGap,
      };

    case "thin_topic_clusters":
      return {
        type: "expand_thin_topic_clusters",
        title: "Expand thin topic clusters with supporting content",
        action: `${insight.evidence.count} cluster(s) need at least 3 supporting pieces around the pillar. Identify subtopics, long-tail questions, and use cases for each thin cluster and create targeted content pieces (800-1500 words each).`,
        priority: "medium",
      };

    case "low_schema_adoption":
      return {
        type: "add_schema_to_existing_content",
        title: "Add schema markup to existing content",
        action: "Implement Article, HowTo, FAQPage, or BreadcrumbList schema on all content pages. Schema helps Google understand topical relationships and improves rich result eligibility.",
        priority: "medium",
      };

    default:
      return {
        type: "schedule_topical_gap_review",
        title: "Schedule quarterly topical authority review",
        action: "Re-run topical authority analysis every quarter to track coverage improvement, identify new competitor gaps, and plan the next content sprint.",
        priority: "low",
      };
  }
}

function prioritizeTopicalAuthorityActions(insightsPayload) {
  const priorityRank = { high: 3, medium: 2, low: 1 };
  const seen = new Set();

  const actionsPayload = insightsPayload
    .map(createActionFromInsight)
    .filter((action) => {
      if (seen.has(action.type)) return false;
      seen.add(action.type);
      return true;
    })
    .sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority] || a.title.localeCompare(b.title));

  if (!seen.has("schedule_topical_gap_review")) {
    actionsPayload.push({
      type: "schedule_topical_gap_review",
      title: "Schedule quarterly topical authority review",
      action: "Re-run topical authority analysis every quarter to track coverage improvement, identify new competitor gaps, and plan the next content sprint.",
      priority: "low",
    });
  }

  const priorityPayload = actionsPayload.map((a) => ({
    type: a.type,
    priority: a.priority,
    title: a.title,
  }));

  return { priorityPayload, actionsPayload };
}

module.exports = { prioritizeTopicalAuthorityActions };
