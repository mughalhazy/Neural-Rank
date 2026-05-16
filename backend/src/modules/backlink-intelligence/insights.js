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

function generateBacklinkInsights(analysisResult) {
  const insights = [];
  const {
    profileSummary,
    authorityDistribution,
    toxicityAnalysis,
    anchorDistribution,
    diversityScore,
    linkVelocity,
    competitorLinkGap,
    overallAuthorityScore,
    authorityTier: tier,
  } = analysisResult;

  const total = profileSummary.totalBacklinks;

  if (toxicityAnalysis.riskLevel === "high") {
    insights.push(buildInsight(
      "high_toxicity_risk",
      `${toxicityAnalysis.toxicCount} toxic backlink(s) detected (spam score >40) — ${Math.round(toxicityAnalysis.toxicRatio * 100)}% of profile. Risk of Google penalty without disavow action.`,
      "high",
      { toxicLinks: true, highCount: toxicityAnalysis.toxicCount > 10 },
    ));
  } else if (toxicityAnalysis.riskLevel === "medium") {
    insights.push(buildInsight(
      "medium_toxicity_risk",
      `${toxicityAnalysis.toxicCount} potentially toxic backlink(s) detected — monitor and consider disavow for worst offenders.`,
      "medium",
      { toxicLinks: true },
    ));
  }

  if (authorityDistribution.authorityScore < 30) {
    insights.push(buildInsight(
      "weak_authority_profile",
      `Domain authority profile is weak — only ${authorityDistribution.high} high-DA referring domain(s). Organic rankings will be limited without stronger authority signals.`,
      "high",
      { lowHighDA: authorityDistribution.high < 5, lowTotalDA: true },
    ));
  }

  const exactMatchRatio = total > 0
    ? (anchorDistribution.exactMatch || 0) / total
    : 0;
  if (exactMatchRatio > 0.3) {
    insights.push(buildInsight(
      "anchor_text_over_optimised",
      `Exact-match anchor text makes up ${Math.round(exactMatchRatio * 100)}% of the link profile — above the 30% threshold that signals manipulation risk to Google.`,
      "medium",
      { highExactMatch: true },
    ));
  }

  if (competitorLinkGap.opportunityCount > 0) {
    const topDomain = competitorLinkGap.topOpportunities[0];
    insights.push(buildInsight(
      "competitor_link_gap",
      `${competitorLinkGap.opportunityCount} domain(s) link to competitors but not to the target. Top opportunity: ${topDomain?.domain || "unknown"} (DA ${topDomain?.domainAuthority || 0}).`,
      competitorLinkGap.opportunityCount > 10 ? "high" : "medium",
      { linkGap: true, topOpportunity: !!topDomain },
    ));
  }

  if (linkVelocity.velocityTrend === "declining") {
    insights.push(buildInsight(
      "declining_link_velocity",
      `Link acquisition has slowed — only ${linkVelocity.recentLinks} new backlink(s) in the last 30 days vs ${linkVelocity.historicalLinks} historically. Proactive link building needed.`,
      "medium",
      { declining: true },
    ));
  } else if (linkVelocity.velocityTrend === "growing") {
    insights.push(buildInsight(
      "growing_link_velocity",
      `Link profile is growing — ${linkVelocity.recentLinks} new backlink(s) in the last 30 days. Maintain the current acquisition pace.`,
      "low",
      { growing: true },
    ));
  }

  insights.push(buildInsight(
    "authority_profile_summary",
    `Overall authority score: ${overallAuthorityScore}/100 (${tier} authority tier). ${profileSummary.totalBacklinks} total backlinks from ${profileSummary.uniqueReferringDomains} unique domains.`,
    overallAuthorityScore < 30 ? "high" : overallAuthorityScore < 60 ? "medium" : "low",
    { hasBacklinks: total > 0, hasReferringDomains: profileSummary.uniqueReferringDomains > 0 },
  ));

  return insights.sort((a, b) => b.severityScore - a.severityScore || b.evidenceCount - a.evidenceCount);
}

module.exports = { generateBacklinkInsights };
