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

function generateTopicalAuthorityInsights(analysisResult) {
  const insights = [];
  const {
    coverageRatio,
    uncoveredTopics,
    clusterAnalysis,
    competitorGapAnalysis,
    semanticDepth,
    overallAuthorityScore,
    authorityTier,
    totalTopics,
  } = analysisResult;

  if (coverageRatio < 0.5 && totalTopics > 0) {
    insights.push(buildInsight(
      "low_topical_coverage",
      `Only ${Math.round(coverageRatio * 100)}% of target topics have existing content — ${uncoveredTopics.length} topic(s) are entirely unaddressed. Google cannot grant topical authority on subjects with no content.`,
      "high",
      { lowCoverage: true, uncoveredCount: uncoveredTopics.length, topics: uncoveredTopics.slice(0, 5) },
    ));
  }

  if (clusterAnalysis.missingPillars.length > 0) {
    const pillarTopics = clusterAnalysis.missingPillars.map((c) => c.topicKey);
    insights.push(buildInsight(
      "missing_pillar_pages",
      `${clusterAnalysis.missingPillars.length} topic(s) have supporting content but no pillar page (2000+ words) — without a pillar, the cluster lacks a ranking anchor and internal link hub.`,
      "high",
      { missingPillars: true, count: clusterAnalysis.missingPillars.length, topics: pillarTopics.slice(0, 5) },
    ));
  }

  if (competitorGapAnalysis.gapCount > 0) {
    const topGaps = competitorGapAnalysis.topicGaps.slice(0, 3).map((g) => `"${g.topic}" (${g.competitorCount} competitor(s))`).join(", ");
    insights.push(buildInsight(
      "competitor_topic_gaps",
      `${competitorGapAnalysis.gapCount} topic(s) are covered by competitors but not by the target. Top gaps: ${topGaps}.`,
      competitorGapAnalysis.gapCount > 5 ? "high" : "medium",
      { hasGaps: true, gapCount: competitorGapAnalysis.gapCount, topGap: competitorGapAnalysis.topicGaps[0]?.topic },
    ));
  }

  if (clusterAnalysis.thinClusters.length > 0) {
    insights.push(buildInsight(
      "thin_topic_clusters",
      `${clusterAnalysis.thinClusters.length} topic cluster(s) have a pillar page but fewer than 3 supporting pieces — thin clusters signal incomplete topical coverage to Google.`,
      "medium",
      { thinClusters: true, count: clusterAnalysis.thinClusters.length },
    ));
  }

  if (semanticDepth.schemaAdoptionRatio < 0.3 && analysisResult.totalContent > 0) {
    insights.push(buildInsight(
      "low_schema_adoption",
      `Only ${Math.round(semanticDepth.schemaAdoptionRatio * 100)}% of content pieces have schema markup — structured data helps Google understand topical relevance and unlocks rich results.`,
      "medium",
      { lowSchema: true },
    ));
  }

  insights.push(buildInsight(
    "topical_authority_summary",
    `Overall topical authority score: ${overallAuthorityScore}/100 (${authorityTier}). Coverage: ${Math.round(coverageRatio * 100)}%, avg cluster score: ${clusterAnalysis.avgClusterScore}/100, content depth score: ${semanticDepth.depthScore}/100.`,
    authorityTier === "thin" ? "high" : authorityTier === "developing" ? "medium" : "low",
    { lowScore: overallAuthorityScore < 40 },
  ));

  return insights.sort((a, b) => b.severityScore - a.severityScore || b.evidenceCount - a.evidenceCount);
}

module.exports = { generateTopicalAuthorityInsights };
