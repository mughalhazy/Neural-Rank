function toPriority(score) {
  if (score >= 10) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function createActionFromInsight(insight) {
  switch (insight.type) {
    case "orphan_pages_detected":
      return {
        type: "link_orphan_pages",
        title: "Add internal links to orphan pages",
        action: `${insight.evidence.orphanCount} page(s) have zero internal links pointing to them. Audit each orphan: either add contextual internal links from relevant pages, include them in navigation, or consolidate/remove them if they lack value.`,
        priority: insight.evidence.highOrphanRatio ? "high" : "medium",
      };

    case "excessive_crawl_depth":
      return {
        type: "flatten_deep_pages",
        title: "Reduce crawl depth for buried pages",
        action: "Pages beyond depth 3 should be surfaced through navigation restructuring, breadcrumb links, footer links, or hub pages. Aim to get all important content within 3 clicks of the homepage.",
        priority: toPriority(insight.severityScore + insight.evidenceCount),
      };

    case "link_equity_concentrated":
      return {
        type: "redistribute_internal_link_equity",
        title: "Redistribute internal link equity across the site",
        action: `Internal links are heavily concentrated on a few pages. Audit your top-linked pages and add internal links from them to under-linked but valuable pages. Use descriptive anchor text matching target keywords.`,
        priority: "medium",
        topPage: insight.evidence.topPage,
      };

    case "weak_topic_silo_structure":
      return {
        type: "strengthen_topic_silos",
        title: "Strengthen topic silo internal linking",
        action: "Ensure every page within a topic cluster links to the cluster's pillar page and to at least 2-3 sibling pages. This consolidates topical authority signals and improves crawl efficiency.",
        priority: "medium",
      };

    case "redirect_chains_detected":
      return {
        type: "eliminate_redirect_chains",
        title: "Collapse redirect chains to single hops",
        action: `${insight.evidence.hasChains ? "Multiple" : "Redirect"} chain(s) detected. Update all source URLs and internal links to point directly to the final destination. Each chain eliminated recovers lost link equity and speeds crawl.`,
        priority: toPriority(insight.severityScore + insight.evidenceCount),
      };

    default:
      return {
        type: "schedule_architecture_reaudit",
        title: "Schedule periodic site architecture reaudit",
        action: "Re-run the site architecture analysis after structural changes to measure crawl depth improvement, orphan page reduction, and link equity distribution.",
        priority: "low",
      };
  }
}

function prioritizeSiteArchitectureActions(insightsPayload) {
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

  if (!seen.has("schedule_architecture_reaudit")) {
    actionsPayload.push({
      type: "schedule_architecture_reaudit",
      title: "Schedule periodic site architecture reaudit",
      action: "Re-run the site architecture analysis after structural changes to measure crawl depth improvement, orphan page reduction, and link equity distribution.",
      priority: "low",
    });
  }

  const priorityPayload = actionsPayload.map((a) => ({ type: a.type, priority: a.priority, title: a.title }));
  return { priorityPayload, actionsPayload };
}

module.exports = { prioritizeSiteArchitectureActions };
