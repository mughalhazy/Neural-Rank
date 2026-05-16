function toPriority(score) {
  if (score >= 10) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function createActionFromInsight(insight) {
  switch (insight.type) {
    case "high_toxicity_risk":
      return {
        type: "disavow_toxic_links",
        title: "Disavow toxic backlinks",
        action: "Export the toxic link list and submit a Google disavow file via Search Console. Remove or request removal of the worst offenders before disavowing.",
        priority: "high",
        toxicCount: insight.evidence.highCount ? "10+" : "under 10",
      };

    case "medium_toxicity_risk":
      return {
        type: "review_suspicious_links",
        title: "Review and monitor suspicious backlinks",
        action: "Manually review borderline-toxic links. Add the worst to a disavow candidate list and re-evaluate on the next audit cycle.",
        priority: "medium",
      };

    case "weak_authority_profile":
      return {
        type: "build_high_da_links",
        title: "Build high-DA backlinks",
        action: "Prioritise link acquisition from domains with DA 60+. Target competitor gap domains, industry publications, and resource pages. Aim for at least 5 new high-DA links per month.",
        priority: "high",
      };

    case "anchor_text_over_optimised":
      return {
        type: "diversify_anchor_text",
        title: "Diversify anchor text profile",
        action: "Future link building should use branded, partial-match, and generic anchors. Avoid soliciting exact-match anchors. Aim to bring exact-match ratio below 20%.",
        priority: "medium",
      };

    case "competitor_link_gap": {
      const topDomains = (insight.evidence.topOpportunity
        ? insight.evidence.competitorOnlyDomains ?? []
        : []
      ).slice(0, 5).map((d) => d.domain).filter(Boolean);

      return {
        type: "outreach_competitor_gap_domains",
        title: "Run outreach campaign targeting competitor link gap",
        action: `${insight.evidence.opportunityCount || "Multiple"} domain(s) link to competitors but not the target. Begin targeted outreach starting with the highest-DA opportunities.`,
        priority: toPriority(insight.severityScore + insight.evidenceCount),
        targetDomains: topDomains,
      };
    }

    case "declining_link_velocity":
      return {
        type: "reactivate_link_building",
        title: "Reactivate link building programme",
        action: "Link acquisition has stalled. Restart outreach, guest posting, and digital PR activities. Set a minimum cadence of 3-5 new referring domains per month.",
        priority: "medium",
      };

    default:
      return {
        type: "monitor_link_velocity",
        title: "Monitor link profile monthly",
        action: "Re-run the backlink intelligence audit monthly to track authority score movement, toxicity changes, and competitor gap evolution.",
        priority: "low",
      };
  }
}

function prioritizeBacklinkActions(insightsPayload) {
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

  if (!seen.has("monitor_link_velocity")) {
    actionsPayload.push({
      type: "monitor_link_velocity",
      title: "Monitor link profile monthly",
      action: "Re-run the backlink intelligence audit monthly to track authority score movement, toxicity changes, and competitor gap evolution.",
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

module.exports = { prioritizeBacklinkActions };
