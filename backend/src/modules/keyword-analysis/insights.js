function createCoverageInsight(analysisResult) {
  return {
    type: "keyword_coverage",
    severity: analysisResult.keywordCount > 0 ? "medium" : "low",
    title: "Keyword opportunity set has been expanded",
    summary: `${analysisResult.suggestions.length} candidate keywords are available from ${analysisResult.keywordCount} provided inputs.`,
    evidenceCount: analysisResult.suggestions.length,
    severityScore: analysisResult.keywordCount > 0 ? 1 : 0,
  };
}

function createHighOpportunityInsight(opportunities) {
  const highOpportunities = opportunities.filter(
    (opportunity) => opportunity.opportunityBand === "high",
  );

  if (highOpportunities.length === 0) {
    return null;
  }

  return {
    type: "high_opportunity_keywords",
    severity: "high",
    title: "High-opportunity keyword candidates are available",
    summary: `${highOpportunities.length} keywords currently fall into the highest opportunity band.`,
    evidenceCount: highOpportunities.length,
    severityScore: highOpportunities.reduce(
      (score, opportunity) => score + opportunity.opportunityScore,
      0,
    ),
    keywords: highOpportunities.map((opportunity) => opportunity.keyword).slice(0, 5),
  };
}

function createSummaryInsight(summary) {
  return {
    type: "keyword_summary",
    severity: summary.highOpportunityCount > 0 ? "high" : "medium",
    title: "Keyword analysis summary is available",
    summary: `${summary.highOpportunityCount} high-opportunity and ${summary.mediumOpportunityCount} medium-opportunity keywords were identified.`,
    evidenceCount: summary.keywordCount,
    severityScore: summary.highOpportunityCount + summary.mediumOpportunityCount,
  };
}

function createQuickWinInsight(opportunities) {
  const quickWins = opportunities.filter((o) => o.opportunityTier === "quick_win");
  if (quickWins.length === 0) return null;
  return {
    type: "quick_win_cluster",
    severity: "high",
    title: "Page 2 keywords are within striking distance",
    summary: `${quickWins.length} keyword(s) rank on page 2 (positions 11-20) — a targeted content or link push could move these to page 1 rapidly.`,
    evidenceCount: quickWins.length,
    severityScore: quickWins.length * 3,
    keywords: quickWins.map((o) => o.keyword).slice(0, 5),
  };
}

function createRisingKeywordInsight(opportunities) {
  const rising = opportunities.filter((o) => o.trendDirection === "rising" && o.source === "direct_input");
  if (rising.length === 0) return null;
  return {
    type: "rising_keyword_opportunity",
    severity: "medium",
    title: "Keywords with growing search volume detected",
    summary: `${rising.length} keyword(s) show rising search volume trends — early optimisation now captures audience before competition intensifies.`,
    evidenceCount: rising.length,
    severityScore: rising.length * 2,
    keywords: rising.map((o) => o.keyword).slice(0, 5),
  };
}

function generateKeywordInsights(analysisResult) {
  const insights = [createCoverageInsight(analysisResult)];
  const highOpportunityInsight = createHighOpportunityInsight(analysisResult.opportunities);
  if (highOpportunityInsight) insights.push(highOpportunityInsight);

  const quickWinInsight = createQuickWinInsight(analysisResult.opportunities);
  if (quickWinInsight) insights.push(quickWinInsight);

  const risingInsight = createRisingKeywordInsight(analysisResult.opportunities);
  if (risingInsight) insights.push(risingInsight);

  insights.push(createSummaryInsight(analysisResult.summary));

  return insights;
}

module.exports = {
  generateKeywordInsights,
};
