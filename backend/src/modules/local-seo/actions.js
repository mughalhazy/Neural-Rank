function toPriority(score) {
  if (score >= 10) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function createActionFromInsight(insight) {
  switch (insight.type) {
    case "gbp_incomplete":
      return {
        type: "complete_gbp_profile",
        title: "Complete Google Business Profile",
        action: [
          insight.evidence.missingCategory ? "Set the primary and secondary business categories." : null,
          insight.evidence.incompleteHours ? "Add complete opening hours including special hours." : null,
          insight.evidence.lowPhotos ? "Upload at least 10 high-quality photos (exterior, interior, team, products)." : null,
          insight.evidence.missingDescription ? "Write a keyword-rich 750-character business description." : null,
          "Enable products/services section and add Q&A responses.",
        ].filter(Boolean).join(" "),
        priority: toPriority(insight.severityScore + insight.evidenceCount),
      };

    case "nap_inconsistency":
      return {
        type: "fix_nap_citations",
        title: "Fix NAP inconsistencies across directories",
        action: "Audit all business directory listings and correct Name, Address, and Phone number to be exactly consistent with the GBP. Focus on high-authority directories first (Yelp, Bing Places, Apple Maps, industry directories).",
        priority: insight.evidence.lowConsistency ? "high" : "medium",
      };

    case "not_in_local_pack":
      return {
        type: "build_local_pack_presence",
        title: "Build local pack presence from scratch",
        action: "With zero local pack presence, focus on: (1) verifying and completing GBP, (2) building 20+ consistent NAP citations, (3) acquiring reviews with local keyword mentions, (4) creating locally-optimised landing pages. Expect 3-6 months to see local pack inclusion.",
        priority: "high",
      };

    case "partial_local_pack_presence":
      return {
        type: "expand_local_pack_coverage",
        title: "Expand local pack coverage to more keywords",
        action: "To appear in more local packs: add keyword-rich GBP posts weekly, respond to all reviews, create content addressing local search queries, and build local backlinks from regional publications and business associations.",
        priority: "medium",
      };

    case "slow_review_velocity":
      return {
        type: "build_review_velocity",
        title: "Build a consistent review acquisition system",
        action: "Implement a post-purchase/service review request via email or SMS. Aim for 4+ reviews per month. Never incentivise reviews (against Google policy). Train staff to ask satisfied customers directly. Respond to every review within 48 hours.",
        priority: "medium",
      };

    default:
      return {
        type: "monitor_local_seo_monthly",
        title: "Monitor local SEO signals monthly",
        action: "Re-run the local SEO audit monthly to track GBP completeness, NAP consistency, pack position changes, and review velocity trends.",
        priority: "low",
      };
  }
}

function prioritizeLocalSeoActions(insightsPayload) {
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

  if (!seen.has("monitor_local_seo_monthly")) {
    actionsPayload.push({
      type: "monitor_local_seo_monthly",
      title: "Monitor local SEO signals monthly",
      action: "Re-run the local SEO audit monthly to track GBP completeness, NAP consistency, pack position changes, and review velocity trends.",
      priority: "low",
    });
  }

  const priorityPayload = actionsPayload.map((a) => ({ type: a.type, priority: a.priority, title: a.title }));
  return { priorityPayload, actionsPayload };
}

module.exports = { prioritizeLocalSeoActions };
