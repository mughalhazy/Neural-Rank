function toPriority(score) {
  if (score >= 10) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function createActionFromInsight(insight) {
  switch (insight.type) {
    case "trust_signals_weak":
      return {
        type: "build_trust_foundation",
        title: "Build core trust signal pages",
        action: [
          insight.evidence.missingAbout ? "Create a detailed About page (300+ words) with team profiles, company history, and mission." : null,
          insight.evidence.missingContact ? "Add a Contact page with physical address, phone number, and email." : null,
          insight.evidence.missingPrivacy ? "Publish a Privacy Policy page." : null,
          insight.evidence.missingTerms ? "Publish Terms of Service." : null,
        ].filter(Boolean).join(" "),
        priority: "high",
      };

    case "author_credibility_weak":
      return {
        type: "add_author_bios_and_credentials",
        title: "Add author bios and credentials to content pages",
        action: "Create author profile pages with credentials, qualifications, and experience. Add bylines and link to author profiles on every article and guide. For medical, legal, or financial content add expert reviewer attribution.",
        priority: "high",
      };

    case "ymyl_eeat_gap":
      return {
        type: "prioritise_eeat_for_ymyl",
        title: "Prioritise E-E-A-T improvements for YMYL niche",
        action: "This site operates in a high-scrutiny niche. Immediately add expert author credentials, cite peer-reviewed or authoritative sources, add medical/legal/financial reviewer sign-off where applicable, and build external citations from credible institutions.",
        priority: "high",
      };

    case "low_external_authority":
      return {
        type: "pursue_external_citations",
        title: "Pursue external citations from authoritative sources",
        action: "Produce original research, data studies, or expert commentary that other sites in your niche will want to cite. Target citations from DA 60+ domains including media, academia, and industry publications.",
        priority: "medium",
      };

    case "no_documented_expertise":
      return {
        type: "document_author_expertise",
        title: "Document expertise across all content authors",
        action: "Add credentials, qualifications, professional profiles (LinkedIn), and areas of expertise to every content author. Consider partnering with recognised industry experts for reviews or co-authorship.",
        priority: "medium",
      };

    default:
      return {
        type: "monitor_eeat_quarterly",
        title: "Monitor E-E-A-T signals quarterly",
        action: "Re-run the E-E-A-T audit quarterly. Track score changes across all four dimensions after implementing improvements.",
        priority: "low",
      };
  }
}

function prioritizeEeatActions(insightsPayload) {
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

  if (!seen.has("monitor_eeat_quarterly")) {
    actionsPayload.push({
      type: "monitor_eeat_quarterly",
      title: "Monitor E-E-A-T signals quarterly",
      action: "Re-run the E-E-A-T audit quarterly. Track score changes across all four dimensions after implementing improvements.",
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

module.exports = { prioritizeEeatActions };
