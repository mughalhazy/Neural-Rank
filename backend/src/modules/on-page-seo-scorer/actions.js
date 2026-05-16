function toPriority(score) {
  if (score >= 10) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function createActionFromInsight(insight, analysisResult) {
  switch (insight.type) {
    case "critical_pages_detected": {
      const urls = (insight.evidence.urls || []).slice(0, 5);
      return {
        type: "fix_critical_pages",
        title: "Fix critically under-optimised pages",
        action: `Prioritise on-page optimisation for the ${insight.evidence.urls?.length || 0} page(s) scoring below 40. Address title tags, H1, meta descriptions, and content depth first.`,
        priority: "high",
        targetUrls: urls,
      };
    }

    case "widespread_title_tag_issues":
      return {
        type: "rewrite_title_tags",
        title: "Rewrite title tags across affected pages",
        action: "Ensure every page has a unique title tag between 50-60 characters containing the primary target keyword in a natural, readable form.",
        priority: "high",
      };

    case "missing_meta_descriptions":
      return {
        type: "add_meta_descriptions",
        title: "Add missing meta descriptions",
        action: "Write unique meta descriptions of 150-160 characters for all pages. Include the primary keyword and a clear value proposition or call to action.",
        priority: "high",
      };

    case "missing_h1_tags":
      return {
        type: "fix_heading_hierarchy",
        title: "Add H1 tags to pages missing them",
        action: "Every page must have exactly one H1 tag containing the primary target keyword. Review heading hierarchy to ensure logical H1 → H2 → H3 structure.",
        priority: toPriority(insight.severityScore + insight.evidenceCount),
      };

    case "thin_content_pages":
      return {
        type: "expand_thin_content",
        title: "Expand thin content pages",
        action: "Pages under 400 words should be expanded to at least 800 words minimum, covering the topic comprehensively. Target competitor content depth as a benchmark.",
        priority: "medium",
      };

    case "most_common_on_page_issue":
      return {
        type: "resolve_widespread_issue",
        title: `Resolve site-wide issue: ${insight.evidence.topIssue || "on-page issue"}`,
        action: `The issue "${insight.evidence.topIssue}" affects ${insight.evidence.affectedCount} page(s). Create a templated fix and apply it systematically across all affected pages.`,
        priority: "medium",
      };

    default:
      return {
        type: "schedule_on_page_reaudit",
        title: "Schedule periodic on-page SEO reaudit",
        action: "Re-score all pages after completing optimisation work to track score improvement and identify any regressions.",
        priority: "low",
      };
  }
}

function prioritizeOnPageActions(insightsPayload, analysisResult) {
  const priorityRank = { high: 3, medium: 2, low: 1 };

  const seen = new Set();
  const actionsPayload = insightsPayload
    .map((insight) => createActionFromInsight(insight, analysisResult))
    .filter((action) => {
      if (seen.has(action.type)) return false;
      seen.add(action.type);
      return true;
    })
    .sort(
      (a, b) =>
        priorityRank[b.priority] - priorityRank[a.priority] ||
        a.title.localeCompare(b.title),
    );

  if (!seen.has("schedule_on_page_reaudit")) {
    actionsPayload.push({
      type: "schedule_on_page_reaudit",
      title: "Schedule periodic on-page SEO reaudit",
      action: "Re-score all pages after completing optimisation work to track score improvement and identify any regressions.",
      priority: "low",
    });
  }

  const priorityPayload = actionsPayload.map((action) => ({
    type: action.type,
    priority: action.priority,
    title: action.title,
  }));

  return { priorityPayload, actionsPayload };
}

module.exports = { prioritizeOnPageActions };
