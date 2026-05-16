function createGapInsight(analysis) {
  if (!analysis.present) {
    return null;
  }

  if (analysis.observations.length === 0) {
    return {
      type: analysis.surface === "app_listing" ? "listing_quality" : "content_quality",
      surface: analysis.surface,
      severity: "low",
      title:
        analysis.surface === "app_listing"
          ? "App listing quality is structurally complete"
          : "Website content quality is structurally complete",
      summary:
        analysis.surface === "app_listing"
          ? "The provided listing includes the expected structure and acceptable keyword coverage."
          : "The provided content includes the expected structure and acceptable keyword coverage.",
      evidenceCount: 0,
      severityScore: 0,
      missingKeywords: analysis.keywordCoverage.missingKeywords,
    };
  }

  return {
    type: analysis.surface === "app_listing" ? "listing_quality" : "content_quality",
    surface: analysis.surface,
    severity: analysis.observations.length >= 3 ? "high" : "medium",
    title:
      analysis.surface === "app_listing"
        ? "App listing quality has actionable gaps"
        : "Website content quality has actionable gaps",
    summary: analysis.observations.join(" "),
    evidenceCount: analysis.observations.length,
    severityScore: analysis.observations.length,
    missingKeywords: analysis.keywordCoverage.missingKeywords,
  };
}

function createSummaryInsight(summary) {
  return {
    type: "content_listing_summary",
    surface: "combined",
    severity:
      summary.websiteObservationCount + summary.listingObservationCount >= 4 ? "high" : "medium",
    title: "Content and listing analysis summary is available",
    summary: `Website observations: ${summary.websiteObservationCount}. Listing observations: ${summary.listingObservationCount}.`,
    evidenceCount: summary.websiteObservationCount + summary.listingObservationCount,
    severityScore: summary.websiteObservationCount + summary.listingObservationCount,
  };
}

function createEeatContentInsight(contentAnalysis) {
  const { eeAtSignals } = contentAnalysis;
  if (!eeAtSignals) return null;
  const hasSignals = eeAtSignals.hasFirstHandContent || eeAtSignals.hasCitations;
  if (hasSignals) return null;
  return {
    type: "weak_eeat_content_signals",
    surface: "website_content",
    severity: "medium",
    title: "Content lacks E-E-A-T signals",
    summary: "No first-hand experience markers or citation signals detected in the content body — adding author voice, real examples, and source references strengthens E-E-A-T scoring.",
    evidenceCount: 2,
    severityScore: 2,
  };
}

function createCompetitorDepthInsight(competitorDepthComparison) {
  if (!competitorDepthComparison || !competitorDepthComparison.isBelowAverage) return null;
  return {
    type: "below_competitor_content_depth",
    surface: "website_content",
    severity: competitorDepthComparison.gap > 500 ? "high" : "medium",
    title: "Content depth is below competitor average",
    summary: `Target content is ${competitorDepthComparison.gap} words shorter than the competitor average of ${competitorDepthComparison.avgCompetitorWordCount} words — thinner content rarely outranks more comprehensive competitor pages.`,
    evidenceCount: 1,
    severityScore: competitorDepthComparison.gap > 500 ? 3 : 2,
    evidence: competitorDepthComparison,
  };
}

function generateContentListingInsights(analysisResult) {
  return [
    createGapInsight(analysisResult.contentAnalysis),
    createGapInsight(analysisResult.listingAnalysis),
    createEeatContentInsight(analysisResult.contentAnalysis),
    createCompetitorDepthInsight(analysisResult.competitorDepthComparison),
    createSummaryInsight(analysisResult.summary),
  ].filter(Boolean);
}

module.exports = {
  generateContentListingInsights,
};
