function severityScore(level) {
  return level === "high" ? 3 : level === "medium" ? 2 : 1;
}

function buildInsight(type, summary, severity, evidence = {}) {
  return {
    type,
    summary,
    severity,
    severityScore: severityScore(severity),
    evidenceCount: Object.keys(evidence).filter((k) => evidence[k]).length,
    evidence,
  };
}

function generateTechnicalSeoInsights(analysisResult) {
  const insights = [];
  const { dimensions, issuesBySeverity, overallHealthScore, healthBand } = analysisResult;

  if (dimensions.coreWebVitals.hasAnyPoor) {
    const poorVitals = [
      dimensions.coreWebVitals.lcp.rating === "poor" ? "LCP" : null,
      dimensions.coreWebVitals.cls.rating === "poor" ? "CLS" : null,
      dimensions.coreWebVitals.inp.rating === "poor" ? "INP" : null,
    ].filter(Boolean);

    insights.push(buildInsight(
      "core_web_vitals_failing",
      `${poorVitals.join(", ")} ${poorVitals.length === 1 ? "is" : "are"} in the poor range — directly impacts ranking eligibility and user experience.`,
      "high",
      { lcp: dimensions.coreWebVitals.lcp.rating === "poor", cls: dimensions.coreWebVitals.cls.rating === "poor", inp: dimensions.coreWebVitals.inp.rating === "poor" },
    ));
  }

  if (dimensions.crawlability.crawlabilityScore < 60) {
    insights.push(buildInsight(
      "crawlability_blocked",
      `${dimensions.crawlability.robotsBlocked} page(s) blocked by robots.txt and ${dimensions.crawlability.noindexCount} page(s) set to noindex — search engines cannot fully index the site.`,
      "high",
      { robotsBlocked: dimensions.crawlability.robotsBlocked > 0, noindexPages: dimensions.crawlability.noindexCount > 0 },
    ));
  }

  if (dimensions.indexation.canonicalIssueCount > 0) {
    insights.push(buildInsight(
      "canonical_issues_detected",
      `${dimensions.indexation.canonicalIssueCount} page(s) have canonical tag issues — risks duplicate content signals and rank dilution.`,
      dimensions.indexation.canonicalIssueCount > 2 ? "high" : "medium",
      { canonicalIssues: true, duplicateUrls: dimensions.indexation.duplicateUrlCount > 0 },
    ));
  }

  if (dimensions.brokenLinks.brokenInternalLinks > 0) {
    insights.push(buildInsight(
      "broken_internal_links",
      `${dimensions.brokenLinks.brokenInternalLinks} broken internal link(s) detected — wastes crawl budget and degrades user experience.`,
      dimensions.brokenLinks.brokenInternalLinks > 5 ? "high" : "medium",
      { brokenInternalLinks: true },
    ));
  }

  if (dimensions.redirects.redirectChainCount > 0 || dimensions.redirects.redirect404Count > 0) {
    insights.push(buildInsight(
      "redirect_issues",
      `${dimensions.redirects.redirectChainCount} redirect chain(s) and ${dimensions.redirects.redirect404Count} broken redirect(s) — each hop loses link equity and slows crawl.`,
      dimensions.redirects.redirect404Count > 0 ? "high" : "medium",
      { redirectChains: dimensions.redirects.redirectChainCount > 0, redirect404s: dimensions.redirects.redirect404Count > 0 },
    ));
  }

  if (dimensions.schema.schemaCoverage === "missing") {
    insights.push(buildInsight(
      "schema_markup_missing",
      "No schema markup detected — missing eligibility for rich results (FAQ, review stars, breadcrumbs) which lift CTR.",
      "medium",
      { noSchema: true },
    ));
  }

  if (dimensions.security.httpsStatus !== "secure") {
    insights.push(buildInsight(
      "security_signal_weak",
      `HTTPS status is "${dimensions.security.httpsStatus}" — browsers flag mixed/insecure pages, reducing trust and ranking.`,
      "medium",
      { httpsIssue: true },
    ));
  }

  insights.push(buildInsight(
    "technical_health_summary",
    `Overall technical health score: ${overallHealthScore}/100 (${healthBand}). ${issuesBySeverity.critical.length} critical issue(s), ${issuesBySeverity.warning.length} warning(s).`,
    overallHealthScore < 50 ? "high" : overallHealthScore < 80 ? "medium" : "low",
    { criticalIssues: issuesBySeverity.critical.length > 0, warnings: issuesBySeverity.warning.length > 0 },
  ));

  return insights.sort((a, b) => b.severityScore - a.severityScore || b.evidenceCount - a.evidenceCount);
}

module.exports = { generateTechnicalSeoInsights };
