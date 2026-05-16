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

function buildFoundationInsight(foundationIssue) {
  if (!foundationIssue) return null;
  return {
    type: "technical_foundation_blocking",
    severity: "high",
    moduleKey: "technical_seo_audit",
    message: `Technical SEO health score is ${foundationIssue.technicalHealthScore}/100 — fix the technical foundation before other optimisation work will achieve full impact. This is the highest-priority action across all modules.`,
    evidence: { healthScore: foundationIssue.technicalHealthScore },
  };
}

function buildQuickWinInsight(quickWinCluster) {
  if (!quickWinCluster) return null;
  return {
    type: "cross_module_quick_win_cluster",
    severity: "high",
    moduleKey: "unified_workflow_layer",
    message: `${quickWinCluster.keywordCount} page-2 keyword(s) identified across ${quickWinCluster.sources.length} module(s) — these are ready to push to page 1 with minimal effort and represent the fastest ranking wins available.`,
    evidence: { keywordCount: quickWinCluster.keywordCount, sources: quickWinCluster.sources },
  };
}

function generateUnifiedWorkflowInsights(analysisResult) {
  const insights = [];

  const foundationInsight = buildFoundationInsight(analysisResult.foundationIssue);
  if (foundationInsight) insights.push(foundationInsight);

  const quickWinInsight = buildQuickWinInsight(analysisResult.quickWinCluster);
  if (quickWinInsight) insights.push(quickWinInsight);

  const prioritizedSummaries = analysisResult.moduleSummaries
    .filter((summary) => summary.actionCount > 0 || summary.priorityCount > 0)
    .sort((left, right) => {
      const leftScore = left.highestPriority === "high" ? 3 : left.highestPriority === "medium" ? 2 : 1;
      const rightScore = right.highestPriority === "high" ? 3 : right.highestPriority === "medium" ? 2 : 1;
      return rightScore - leftScore;
    })
    .slice(0, 3);

  insights.push(...prioritizedSummaries.map(buildCrossModuleInsight));
  insights.push(buildWorkflowInsight(analysisResult.summary));
  return insights;
}

module.exports = {
  generateUnifiedWorkflowInsights,
};
