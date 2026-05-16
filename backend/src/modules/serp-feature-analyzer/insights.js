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

function generateSerpFeatureInsights(analysisResult) {
  const insights = [];
  const {
    keywordAnalyses,
    highValueGaps,
    totalFeatureGaps,
    totalEstimatedCtrLift,
    topOpportunity,
    featureOwnershipRatioAvg,
  } = analysisResult;

  const snippetGaps = (analysisResult.allGaps || []).filter((g) => g.feature === "featured_snippet");
  if (snippetGaps.length > 0) {
    const kws = snippetGaps.slice(0, 3).map((g) => `"${g.keyword}"`).join(", ");
    insights.push(buildInsight(
      "featured_snippet_opportunity",
      `${snippetGaps.length} keyword(s) have a featured snippet in the SERP that the target doesn't own — each snippet claimed effectively puts you at position 0: ${kws}.`,
      "high",
      { snippetGap: true, count: snippetGaps.length },
    ));
  }

  const localPackGaps = (analysisResult.allGaps || []).filter((g) => g.feature === "local_pack");
  if (localPackGaps.length > 0) {
    insights.push(buildInsight(
      "local_pack_gap",
      `${localPackGaps.length} keyword(s) trigger a local pack that the target doesn't appear in — local pack results receive up to 15% additional CTR boost over standard organic results.`,
      "high",
      { localPackGap: true, count: localPackGaps.length },
    ));
  }

  const paaGaps = (analysisResult.allGaps || []).filter((g) => g.feature === "people_also_ask");
  if (paaGaps.length > 0) {
    insights.push(buildInsight(
      "people_also_ask_gap",
      `${paaGaps.length} keyword(s) have People Also Ask boxes the target isn't featured in — FAQ schema and structured Q&A content can unlock these.`,
      "medium",
      { paaGap: true, count: paaGaps.length },
    ));
  }

  if (totalEstimatedCtrLift > 0) {
    insights.push(buildInsight(
      "total_ctr_lift_opportunity",
      `Capturing all identified SERP feature gaps could deliver an estimated +${totalEstimatedCtrLift}% cumulative CTR uplift across tracked keywords — without changing any rankings.`,
      highValueGaps.length > 2 ? "high" : "medium",
      { hasLift: true, highValueGaps: highValueGaps.length > 0 },
    ));
  }

  insights.push(buildInsight(
    "serp_feature_ownership_summary",
    `Average SERP feature ownership: ${featureOwnershipRatioAvg}% across ${keywordAnalyses.length} keyword(s). ${totalFeatureGaps} total feature gap(s) identified.`,
    featureOwnershipRatioAvg < 40 ? "high" : featureOwnershipRatioAvg < 70 ? "medium" : "low",
    { hasGaps: totalFeatureGaps > 0 },
  ));

  return insights.sort((a, b) => b.severityScore - a.severityScore || b.evidenceCount - a.evidenceCount);
}

module.exports = { generateSerpFeatureInsights };
