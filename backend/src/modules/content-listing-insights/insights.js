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

function generateContentListingInsights(analysisResult) {
  return [
    createGapInsight(analysisResult.contentAnalysis),
    createGapInsight(analysisResult.listingAnalysis),
    createSummaryInsight(analysisResult.summary),
  ].filter(Boolean);
}

module.exports = {
  generateContentListingInsights,
};
