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

function generateSiteArchitectureInsights(analysisResult) {
  const insights = [];
  const { crawlDepth, orphanAnalysis, linkEquity, siloAnalysis, redirectAnalysis, overallArchitectureScore, architectureBand } = analysisResult;

  if (orphanAnalysis.orphanRatio > 0.05) {
    insights.push(buildInsight(
      "orphan_pages_detected",
      `${orphanAnalysis.orphanCount} orphan page(s) detected (${Math.round(orphanAnalysis.orphanRatio * 100)}% of site) — pages with no internal links receive no crawl equity and are likely invisible to search engines.`,
      orphanAnalysis.orphanSeverity,
      { highOrphanRatio: orphanAnalysis.orphanRatio > 0.1, orphanCount: orphanAnalysis.orphanCount > 0 },
    ));
  }

  if (crawlDepth.deepPageRatio > 0.15) {
    insights.push(buildInsight(
      "excessive_crawl_depth",
      `${Math.round(crawlDepth.deepPageRatio * 100)}% of pages are buried at depth 4+ — Googlebot crawl budget prioritises shallow pages and may never reach deep content.`,
      crawlDepth.deepPageRatio > 0.3 ? "high" : "medium",
      { deepPages: crawlDepth.buckets.depth4plus > 0 },
    ));
  }

  if (linkEquity.equityGiniCoefficient > 0.7) {
    const topPage = linkEquity.topLinkedPages[0];
    insights.push(buildInsight(
      "link_equity_concentrated",
      `Internal link equity is heavily concentrated (Gini: ${linkEquity.equityGiniCoefficient}) — a few pages absorb most links while others are starved of authority signals.`,
      "medium",
      { concentrated: true, topPage: topPage?.url },
    ));
  }

  if (siloAnalysis.siloScore < 60 && siloAnalysis.totalClusters > 1) {
    insights.push(buildInsight(
      "weak_topic_silo_structure",
      `Only ${siloAnalysis.crossLinkedClusters} of ${siloAnalysis.totalClusters} topic cluster(s) are internally cross-linked — isolated silos waste topical authority signals and fragment crawl paths.`,
      "medium",
      { weakSilos: true },
    ));
  }

  if (redirectAnalysis.chainCount > 0) {
    insights.push(buildInsight(
      "redirect_chains_detected",
      `${redirectAnalysis.chainCount} redirect chain(s) detected (max depth: ${redirectAnalysis.maxChainDepth}) — each redirect hop loses approximately 10-15% of link equity and slows crawl.`,
      redirectAnalysis.chainCount > 5 ? "high" : "medium",
      { hasChains: true },
    ));
  }

  insights.push(buildInsight(
    "architecture_health_summary",
    `Site architecture score: ${overallArchitectureScore}/100 (${architectureBand}). ${crawlDepth.totalPages} pages analysed — depth distribution: 1: ${crawlDepth.buckets.depth1}, 2: ${crawlDepth.buckets.depth2}, 3: ${crawlDepth.buckets.depth3}, 4+: ${crawlDepth.buckets.depth4plus}.`,
    architectureBand === "poor" ? "high" : architectureBand === "needs_work" ? "medium" : "low",
    { hasIssues: overallArchitectureScore < 75 },
  ));

  return insights.sort((a, b) => b.severityScore - a.severityScore || b.evidenceCount - a.evidenceCount);
}

module.exports = { generateSiteArchitectureInsights };
