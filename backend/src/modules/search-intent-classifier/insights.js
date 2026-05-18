function severityScore(level) {
  return level === "high" ? 3 : level === "medium" ? 2 : 1;
}

function buildInsight(type, summary, severity, evidence = {}) {
  return {
    type,
    summary,
    severity,
    severityScore: severityScore(severity),
    evidenceCount: Object.values(evidence).filter(Boolean).length,
    evidence,
  };
}

function generateSearchIntentInsights(analysisResult) {
  const insights = [];
  const {
    misalignedKeywords,
    highValueMisaligned,
    intentDistribution,
    alignmentScore,
    totalKeywords,
    classifiedKeywords,
  } = analysisResult;

  if (highValueMisaligned.length > 0) {
    const examples = highValueMisaligned.slice(0, 3).map((k) => `"${k.keyword}" (${k.primaryIntent})`).join(", ");
    insights.push(buildInsight(
      "high_value_intent_mismatch",
      `${highValueMisaligned.length} commercial or transactional keyword(s) are served by the wrong content format — these directly cost conversions: ${examples}.`,
      "high",
      {
        highValueMisaligned: true,
        count: highValueMisaligned.length,
        examples: highValueMisaligned.map((k) => k.keyword),
      },
    ));
  }

  if (misalignedKeywords.length > 3) {
    insights.push(buildInsight(
      "widespread_intent_misalignment",
      `${misalignedKeywords.length} keyword(s) are served by content that doesn't match their search intent — Google may deprioritise mismatched pages regardless of technical quality.`,
      misalignedKeywords.length > 5 ? "high" : "medium",
      { misalignedCount: misalignedKeywords.length, alignmentScore },
    ));
  } else if (misalignedKeywords.length > 0) {
    insights.push(buildInsight(
      "intent_misalignment_detected",
      `${misalignedKeywords.length} keyword(s) have a content format mismatch. Reformatting these pages to match search intent can improve rankings without adding new content.`,
      "medium",
      { misalignedCount: misalignedKeywords.length },
    ));
  }

  const dominant = Object.entries(intentDistribution)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);

  if (dominant.length > 0) {
    const [topIntent] = dominant[0];
    insights.push(buildInsight(
      "intent_distribution_overview",
      `Intent breakdown across ${totalKeywords} keyword(s): ${dominant.map(([k, v]) => `${k} (${v})`).join(", ")}. Dominant intent is "${topIntent}" — content strategy should reflect this.`,
      "low",
      { hasDistribution: true },
    ));
  }

  const noContentKeywords = classifiedKeywords.filter((k) => k.alignmentStatus === "unknown").length;
  if (noContentKeywords > 0) {
    insights.push(buildInsight(
      "keywords_without_content",
      `${noContentKeywords} keyword(s) have no existing content mapped to them — these represent content creation opportunities matched to the correct format from the start.`,
      "medium",
      { missingContent: noContentKeywords > 0 },
    ));
  }

  insights.push(buildInsight(
    "intent_alignment_summary",
    `Overall intent alignment score: ${alignmentScore}% across ${totalKeywords} keyword(s). ${misalignedKeywords.length} misaligned, ${analysisResult.alignedKeywords.length} aligned.`,
    alignmentScore < 50 ? "high" : alignmentScore < 80 ? "medium" : "low",
    { lowAlignment: alignmentScore < 50 },
  ));

  return insights.sort((a, b) => b.severityScore - a.severityScore || b.evidenceCount - a.evidenceCount);
}

module.exports = { generateSearchIntentInsights };
