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

function generateAnalyticsInsights(analysisResult) {
  const insights = [];
  const { ctrAnalysis, trafficOpportunities, indexHealth, landingPagePerformance, overallHealthScore, healthBand, totalSearchQueries } = analysisResult;

  if (ctrAnalysis.highImpressionLowCtr.length > 0) {
    const top = ctrAnalysis.highImpressionLowCtr[0];
    insights.push(buildInsight(
      "ctr_opportunity_detected",
      `${ctrAnalysis.highImpressionLowCtr.length} keyword(s) have high impressions but low CTR — top opportunity: "${top.query}" (~${top.impressions} impressions, ${Math.round((top.ctr || 0) * 100)}% CTR vs ${Math.round(100 * (top.ctrExpected || 0.05))}% expected). Estimated +${ctrAnalysis.totalEstimatedLift} clicks recoverable through title/meta improvements.`,
      "high",
      { hasCtrGap: true, count: ctrAnalysis.highImpressionLowCtr.length, lift: ctrAnalysis.totalEstimatedLift > 0 },
    ));
  }

  if (trafficOpportunities.page2Keywords.length > 0) {
    const examples = trafficOpportunities.page2Keywords.slice(0, 3).map((k) => `"${k.query}"`).join(", ");
    insights.push(buildInsight(
      "page2_quick_wins",
      `${trafficOpportunities.page2Keywords.length} keyword(s) rank on page 2 with real search impressions — these are the highest ROI ranking opportunities: ${examples}.`,
      "high",
      { hasPage2Keywords: true, count: trafficOpportunities.page2Keywords.length },
    ));
  }

  if (landingPagePerformance.decliningPages.length > 0) {
    const worst = landingPagePerformance.decliningPages[0];
    insights.push(buildInsight(
      "declining_organic_pages",
      `${landingPagePerformance.decliningPages.length} page(s) have lost more than 20% of organic sessions — worst: "${worst.url}" (-${worst.dropPercent}%). These need immediate investigation.`,
      "high",
      { hasDecline: true, count: landingPagePerformance.decliningPages.length },
    ));
  }

  if (indexHealth.totalErrors > 0 || indexHealth.indexCoverage.errors > 0) {
    const totalIssues = indexHealth.totalErrors + indexHealth.indexCoverage.errors;
    insights.push(buildInsight(
      "index_coverage_errors",
      `${totalIssues} indexation error(s) detected — pages with crawl or coverage errors cannot rank regardless of content quality.`,
      totalIssues > 10 ? "high" : "medium",
      { hasErrors: true, errorCount: indexHealth.totalErrors > 0, coverageErrors: indexHealth.indexCoverage.errors > 0 },
    ));
  }

  if (landingPagePerformance.zeroConversionHighTraffic.length > 0) {
    insights.push(buildInsight(
      "high_traffic_zero_conversion",
      `${landingPagePerformance.zeroConversionHighTraffic.length} high-traffic page(s) generate zero conversions — significant revenue opportunity from conversion rate optimisation.`,
      "medium",
      { hasZeroConversion: true, count: landingPagePerformance.zeroConversionHighTraffic.length },
    ));
  }

  insights.push(buildInsight(
    "analytics_health_summary",
    `Analytics health score: ${overallHealthScore}/100 (${healthBand}). ${totalSearchQueries} search queries tracked, ${landingPagePerformance.topPages.length} landing pages analysed.`,
    healthBand === "critical" ? "high" : healthBand === "needs_work" ? "medium" : "low",
    { hasData: totalSearchQueries > 0, lowScore: overallHealthScore < 50 },
  ));

  return insights.sort((a, b) => b.severityScore - a.severityScore || b.evidenceCount - a.evidenceCount);
}

module.exports = { generateAnalyticsInsights };
