function toPriority(score) {
  if (score >= 10) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function createActionFromInsight(insight) {
  switch (insight.type) {
    case "featured_snippet_opportunity":
      return {
        type: "optimize_for_featured_snippet",
        title: "Optimise content for featured snippet capture",
        action: `${insight.evidence.count} featured snippet gap(s) identified. Restructure the serving pages to include: a concise definition paragraph (40-60 words), a step-by-step numbered list for process queries, or a comparison table for "vs" queries. Place the target keyword in the first H2 and answer the query directly in the first paragraph.`,
        priority: "high",
      };

    case "local_pack_gap":
      return {
        type: "optimise_for_local_pack",
        title: "Optimise for local pack inclusion",
        action: `${insight.evidence.count} local pack gap(s) detected. Complete and verify Google Business Profile with accurate categories, opening hours, photos (10+), and service descriptions. Ensure NAP (Name, Address, Phone) is consistent across all citations. Build local citations on relevant directories.`,
        priority: "high",
      };

    case "people_also_ask_gap":
      return {
        type: "add_faq_schema_for_paa",
        title: "Add FAQ schema to capture People Also Ask boxes",
        action: `${insight.evidence.count} PAA gap(s) found. Add FAQ schema markup to relevant pages and include question-format H2/H3 headings followed by concise 40-60 word answers. Target the specific questions appearing in the PAA box for each keyword.`,
        priority: "medium",
      };

    case "total_ctr_lift_opportunity":
      return {
        type: "prioritise_serp_feature_capture",
        title: "Prioritise SERP feature capture as a quick CTR win",
        action: "SERP feature gaps represent CTR gains achievable without ranking changes. Work through the feature gap list starting with featured snippets and sitelinks (highest CTR boost), then PAA boxes, then image/video carousels.",
        priority: toPriority(insight.severityScore + insight.evidenceCount),
      };

    default:
      return {
        type: "monitor_serp_feature_ownership",
        title: "Monitor SERP feature ownership monthly",
        action: "Re-run the SERP feature analyser monthly to track feature capture progress and identify new gap opportunities as SERPs evolve.",
        priority: "low",
      };
  }
}

function prioritizeSerpFeatureActions(insightsPayload) {
  const priorityRank = { high: 3, medium: 2, low: 1 };
  const seen = new Set();

  const actionsPayload = insightsPayload
    .map(createActionFromInsight)
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

  if (!seen.has("monitor_serp_feature_ownership")) {
    actionsPayload.push({
      type: "monitor_serp_feature_ownership",
      title: "Monitor SERP feature ownership monthly",
      action: "Re-run the SERP feature analyser monthly to track feature capture progress and identify new gap opportunities as SERPs evolve.",
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

module.exports = { prioritizeSerpFeatureActions };
