function toPriority(score) {
  if (score >= 10) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function createActionFromInsight(insight) {
  switch (insight.type) {
    case "ctr_opportunity_detected":
      return {
        type: "optimise_titles_meta_for_ctr",
        title: "Optimise title tags and meta descriptions for CTR",
        action: `${insight.evidence.count} keyword(s) are receiving significantly fewer clicks than their rank position warrants. Rewrite title tags to include power words, numbers, and emotional triggers. Ensure meta descriptions contain a clear benefit statement and call to action. Test multiple variants.`,
        priority: "high",
        estimatedClickLift: insight.evidence.lift ? "measurable" : null,
      };

    case "page2_quick_wins":
      return {
        type: "push_page2_to_page1",
        title: "Push page 2 keywords to page 1 with targeted effort",
        action: `${insight.evidence.count} keyword(s) with real impression volume sit on page 2. For each: audit the ranking page for content depth, internal links, and on-page signals. Add 2-3 targeted backlinks and refresh content. These deliver the highest ROI per unit of effort.`,
        priority: "high",
      };

    case "declining_organic_pages":
      return {
        type: "investigate_declining_pages",
        title: "Investigate and recover declining organic pages",
        action: `${insight.evidence.count} page(s) have lost 20%+ of organic sessions. Check for: algorithm updates affecting the niche, content freshness issues, cannibalization from new pages, technical regressions, or lost backlinks. Prioritise pages with the steepest drops.`,
        priority: "high",
      };

    case "index_coverage_errors":
      return {
        type: "fix_index_coverage_errors",
        title: "Resolve indexation and crawl errors",
        action: "Pages with coverage errors are invisible to Google regardless of quality. Audit Google Search Console for specific error types (404, server errors, redirect errors, blocked by robots). Fix systematically starting with highest-traffic affected pages.",
        priority: toPriority(insight.severityScore + insight.evidenceCount),
      };

    case "high_traffic_zero_conversion":
      return {
        type: "add_cta_to_zero_conversion_pages",
        title: "Add conversion paths to high-traffic zero-conversion pages",
        action: `${insight.evidence.count} page(s) receive significant organic traffic but convert nobody. Add clear CTAs, lead capture forms, or product links. Review page intent alignment — the organic traffic may be informational but the page is transactional.`,
        priority: "medium",
      };

    default:
      return {
        type: "refresh_analytics_review_monthly",
        title: "Refresh analytics review monthly",
        action: "Re-run the analytics integration module monthly to track CTR improvement, page recovery, and index health trends over time.",
        priority: "low",
      };
  }
}

function prioritizeAnalyticsActions(insightsPayload) {
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

  if (!seen.has("refresh_analytics_review_monthly")) {
    actionsPayload.push({
      type: "refresh_analytics_review_monthly",
      title: "Refresh analytics review monthly",
      action: "Re-run the analytics integration module monthly to track CTR improvement, page recovery, and index health trends over time.",
      priority: "low",
    });
  }

  const priorityPayload = actionsPayload.map((a) => ({ type: a.type, priority: a.priority, title: a.title }));
  return { priorityPayload, actionsPayload };
}

module.exports = { prioritizeAnalyticsActions };
