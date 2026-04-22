function toPriority(score) {
  if (score >= 8) {
    return "high";
  }

  if (score >= 4) {
    return "medium";
  }

  return "low";
}

function createComplaintAction(insight) {
  return {
    type: "investigate_complaint_cluster",
    priority: toPriority(insight.evidenceCount + insight.severityScore),
    clusterKey: insight.clusterKey,
    action: `Investigate the recurring ${insight.clusterKey} complaint pattern and define a corrective response.`,
    title: `Prioritize ${insight.clusterKey} review complaints`,
    evidence: {
      evidenceCount: insight.evidenceCount,
      severityScore: insight.severityScore,
      sampleReviews: insight.sampleReviews || [],
    },
  };
}

function createFeatureRequestAction(insight) {
  return {
    type: "evaluate_feature_request_pattern",
    priority: toPriority(insight.evidenceCount + insight.severityScore),
    clusterKey: insight.clusterKey,
    action:
      "Assess the recurring feature request pattern and determine whether it belongs in the product roadmap.",
    title: "Review recurring feature requests",
    evidence: {
      evidenceCount: insight.evidenceCount,
      severityScore: insight.severityScore,
      sampleRequests: insight.sampleRequests || [],
    },
  };
}

function createSummaryAction(insight) {
  return {
    type: "review_analysis_follow_up",
    priority: "low",
    clusterKey: insight.clusterKey,
    action:
      insight.evidenceCount > 0
        ? "Re-run review analysis after corrective changes to confirm complaint reduction."
        : "Collect additional review input before treating review analysis as complete.",
    title: "Maintain review analysis follow-up",
    evidence: {
      evidenceCount: insight.evidenceCount,
      severityScore: insight.severityScore,
    },
  };
}

function prioritizeReviewActions(insightsPayload = []) {
  const actionsPayload = insightsPayload
    .map((insight) => {
      if (insight.type === "feature_request_pattern") {
        return createFeatureRequestAction(insight);
      }

      if (insight.type === "review_summary") {
        return createSummaryAction(insight);
      }

      return createComplaintAction(insight);
    })
    .sort((left, right) => {
      const priorityRank = { high: 3, medium: 2, low: 1 };
      return (
        priorityRank[right.priority] - priorityRank[left.priority] ||
        left.title.localeCompare(right.title)
      );
    });

  const priorityPayload = actionsPayload.map((action) => ({
    type: action.type,
    priority: action.priority,
    clusterKey: action.clusterKey,
    title: action.title,
  }));

  return {
    priorityPayload,
    actionsPayload,
  };
}

module.exports = {
  prioritizeReviewActions,
};
