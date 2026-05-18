function toPriority(score) {
  if (score >= 10) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function createActionFromInsight(insight) {
  switch (insight.type) {
    case "high_value_intent_mismatch": {
      const keywords = insight.evidence.examples || [];
      return {
        type: "reformat_high_value_misaligned_content",
        title: "Reformat high-value misaligned content pages",
        action: `${insight.evidence.count} commercial/transactional keyword(s) are served by wrong content types. Prioritise reformatting these pages — the revenue impact is direct. ${keywords.length > 0 ? `Affected keywords: ${keywords.join(", ")}.` : ""}`,
        priority: "high",
        affectedKeywords: keywords,
      };
    }

    case "widespread_intent_misalignment":
      return {
        type: "conduct_intent_audit",
        title: "Conduct a full content-intent alignment audit",
        action: `${insight.evidence.misalignedCount} pages have intent mismatches. Map each page to its primary keyword's intent and restructure content format accordingly. Use the classified keyword list as a prioritised audit checklist.`,
        priority: toPriority(insight.severityScore + insight.evidenceCount),
      };

    case "intent_misalignment_detected":
      return {
        type: "reformat_misaligned_content",
        title: "Reformat misaligned content to match search intent",
        action: "Review each misaligned keyword's recommended content format and restructure the serving page. Even minor format changes (adding an FAQ section, restructuring as a listicle) can resolve mismatches.",
        priority: "medium",
      };

    case "keywords_without_content":
      return {
        type: "create_intent_matched_content",
        title: "Create new content matched to keyword intent from the start",
        action: `${insight.evidence.missingContent} keyword(s) have no content. Before creating new pages, check the intent classification to ensure the correct format is chosen. Use FORMAT_GUIDANCE per intent type.`,
        priority: "medium",
      };

    default:
      return {
        type: "audit_content_format_quarterly",
        title: "Schedule quarterly content-intent alignment review",
        action: "Re-run the search intent classifier every quarter after publishing new content to catch format drift before it affects rankings.",
        priority: "low",
      };
  }
}

function prioritizeSearchIntentActions(insightsPayload) {
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

  if (!seen.has("audit_content_format_quarterly")) {
    actionsPayload.push({
      type: "audit_content_format_quarterly",
      title: "Schedule quarterly content-intent alignment review",
      action: "Re-run the search intent classifier every quarter after publishing new content to catch format drift before it affects rankings.",
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

module.exports = { prioritizeSearchIntentActions };
