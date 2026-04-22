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

function generateKeywordInsights(analysisResult) {
  const insights = [createCoverageInsight(analysisResult)];
  const highOpportunityInsight = createHighOpportunityInsight(analysisResult.opportunities);

  if (highOpportunityInsight) {
    insights.push(highOpportunityInsight);
  }

  insights.push(createSummaryInsight(analysisResult.summary));

  return insights;
}

module.exports = {
  generateKeywordInsights,
};
