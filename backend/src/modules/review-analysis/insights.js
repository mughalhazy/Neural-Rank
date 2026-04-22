function createComplaintInsight(cluster) {
  return {
    type: "complaint_cluster",
    severity: cluster.severityScore >= 5 ? "high" : "medium",
    clusterKey: cluster.clusterKey,
    title: `${cluster.label} complaints are recurring in reviews`,
    summary: `${cluster.evidenceCount} reviews mention ${cluster.label.toLowerCase()} issues.`,
    evidenceCount: cluster.evidenceCount,
    severityScore: cluster.severityScore,
    sampleReviews: cluster.sampleReviews,
  };
}

function createFeatureRequestInsight(featureRequests) {
  return {
    type: "feature_request_pattern",
    severity: featureRequests.length >= 3 ? "medium" : "low",
    clusterKey: "feature_requests",
    title: "Feature requests are appearing in customer feedback",
    summary: `${featureRequests.length} reviews contain direct feature request language.`,
    evidenceCount: featureRequests.length,
    severityScore: featureRequests.reduce(
      (total, request) => total + request.severityScore,
      0,
    ),
    sampleRequests: featureRequests.slice(0, 3).map((request) => request.requestSummary),
  };
}

function createSummaryInsight(summary) {
  return {
    type: "review_summary",
    severity:
      summary.reviewCount > 0 && summary.averageRating !== null && summary.averageRating <= 2.5
        ? "high"
        : "medium",
    clusterKey: "review_summary",
    title: "Review analysis summary is available",
    summary:
      summary.reviewCount > 0
        ? `${summary.reviewCount} reviews were analyzed with ${summary.complaintClusterCount} complaint clusters detected.`
        : "No reviews were available for analysis.",
    evidenceCount: summary.reviewCount,
    severityScore: summary.complaintClusterCount + summary.featureRequestCount,
  };
}

function generateReviewInsights(analysisResult) {
  const complaintInsights = analysisResult.complaintClusters.map(createComplaintInsight);
  const featureRequestInsights =
    analysisResult.featureRequests.length > 0
      ? [createFeatureRequestInsight(analysisResult.featureRequests)]
      : [];

  const summaryInsight = [createSummaryInsight(analysisResult.summary)];

  return [...complaintInsights, ...featureRequestInsights, ...summaryInsight];
}

module.exports = {
  generateReviewInsights,
};
