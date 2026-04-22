function buildCrossModuleInsight(moduleSummary) {
  return {
    type: "cross_module_summary",
    severity: moduleSummary.highestPriority === "high" ? "high" : "medium",
    moduleKey: moduleSummary.moduleKey,
    message: `${moduleSummary.moduleKey} contributes ${moduleSummary.actionCount} actions with ${moduleSummary.highestPriority} as its highest current priority.`,
    evidence: moduleSummary,
  };
}

function buildWorkflowInsight(summary) {
  return {
    type: "workflow_consolidation_summary",
    severity: summary.highestPriorityCount > 0 ? "high" : "medium",
    message:
      summary.totalActions > 0
        ? `${summary.totalActions} actions are available for cross-module consolidation across ${summary.moduleCount} modules.`
        : "No module actions are currently available for unified workflow consolidation.",
    evidence: summary,
  };
}

function generateUnifiedWorkflowInsights(analysisResult) {
  const prioritizedSummaries = analysisResult.moduleSummaries
    .filter((summary) => summary.actionCount > 0 || summary.priorityCount > 0)
    .sort((left, right) => {
      const leftScore = left.highestPriority === "high" ? 3 : left.highestPriority === "medium" ? 2 : 1;
      const rightScore = right.highestPriority === "high" ? 3 : right.highestPriority === "medium" ? 2 : 1;
      return rightScore - leftScore;
    })
    .slice(0, 3);

  const insights = prioritizedSummaries.map(buildCrossModuleInsight);
  insights.push(buildWorkflowInsight(analysisResult.summary));
  return insights;
}

module.exports = {
  generateUnifiedWorkflowInsights,
};
