function buildAssetInsight(finding) {
  const primaryIssue = finding.issues[0] || "messaging_gap";

  return {
    type: "messaging_gap",
    severity: finding.issues.length >= 3 ? "high" : "medium",
    assetRef: finding.assetRef,
    message: `${finding.headline} needs messaging refinement, led by ${primaryIssue}.`,
    evidence: {
      issues: finding.issues,
      matchedThemes: finding.matchedThemes,
      bodyLength: finding.bodyLength,
      audienceSignalCount: finding.audienceSignalCount,
    },
  };
}

function buildCoverageInsight(summary) {
  return {
    type: "messaging_coverage_summary",
    severity: summary.assetsNeedingWork > 0 ? "medium" : "low",
    message:
      summary.assetsNeedingWork > 0
        ? `${summary.assetsNeedingWork} creative assets need stronger messaging alignment.`
        : "Tracked messaging assets do not currently show major critique findings.",
    evidence: summary,
  };
}

function generateCreativeMessagingInsights(analysisResult) {
  const prioritizedFindings = analysisResult.assetFindings
    .filter((finding) => finding.issues.length > 0)
    .sort((left, right) => right.issues.length - left.issues.length)
    .slice(0, 3);

  const insights = prioritizedFindings.map(buildAssetInsight);
  insights.push(buildCoverageInsight(analysisResult.summary));
  return insights;
}

module.exports = {
  generateCreativeMessagingInsights,
};
