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
      readabilityLevel: finding.readabilityLevel,
      keywordDensity: finding.keywordDensity,
      semanticRichness: finding.semanticRichness,
      freshnessSignal: finding.freshnessSignal,
    },
  };
}

function buildStaleContentInsight(staleFindings) {
  if (staleFindings.length === 0) return null;
  return {
    type: "stale_content_detected",
    severity: "medium",
    sectionRef: null,
    message: `${staleFindings.length} section(s) have not been updated in over 12 months — stale content degrades freshness signals and may lose ranking position over time.`,
    evidence: { staleCount: staleFindings.length, staleSections: staleFindings.map((f) => f.sectionRef) },
  };
}

function buildReadabilityInsight(complexFindings) {
  if (complexFindings.length === 0) return null;
  return {
    type: "readability_too_complex",
    severity: "medium",
    sectionRef: null,
    message: `${complexFindings.length} section(s) have complex readability scores — dense, long-sentence content scores lower on user experience signals and reduces dwell time.`,
    evidence: { complexCount: complexFindings.length },
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

  const staleFindings = analysisResult.sectionFindings.filter((f) => f.freshnessSignal === "stale_candidate");
  const staleInsight = buildStaleContentInsight(staleFindings);
  if (staleInsight) insights.push(staleInsight);

  const complexFindings = analysisResult.sectionFindings.filter((f) => f.readabilityLevel === "complex");
  const readabilityInsight = buildReadabilityInsight(complexFindings);
  if (readabilityInsight) insights.push(readabilityInsight);

  insights.push(buildCoverageInsight(analysisResult.summary));
  return insights;
}

module.exports = {
  generateOptimizationInsights,
};
