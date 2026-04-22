function buildSectionInsight(finding) {
  const primaryIssue = finding.issues[0] || "optimization_gap";

  return {
    type: "optimization_gap",
    severity: finding.issues.length >= 3 ? "high" : "medium",
    sectionRef: finding.sectionRef,
    message: `${finding.title} requires optimization attention, led by ${primaryIssue}.`,
    evidence: {
      issues: finding.issues,
      missingKeywordCount: finding.missingKeywordCount,
      metadataCoverage: finding.metadataCoverage,
      contentLength: finding.contentLength,
    },
  };
}

function buildCoverageInsight(summary) {
  return {
    type: "optimization_coverage_summary",
    severity: summary.sectionsNeedingOptimization > 0 ? "medium" : "low",
    message:
      summary.sectionsNeedingOptimization > 0
        ? `${summary.sectionsNeedingOptimization} sections need optimization work before this module should be considered complete.`
        : "Tracked sections do not currently show major optimization gaps.",
    evidence: summary,
  };
}

function generateOptimizationInsights(analysisResult) {
  const prioritizedFindings = analysisResult.sectionFindings
    .filter((finding) => finding.issues.length > 0)
    .sort((left, right) => right.issues.length - left.issues.length)
    .slice(0, 3);

  const insights = prioritizedFindings.map(buildSectionInsight);
  insights.push(buildCoverageInsight(analysisResult.summary));
  return insights;
}

module.exports = {
  generateOptimizationInsights,
};
