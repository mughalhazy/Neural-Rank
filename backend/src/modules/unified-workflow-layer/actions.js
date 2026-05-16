const {
  orderActionEntries,
} = require("../../core/prioritization");

function buildConsolidatedAction(priorityEntry) {
  return {
    type: "unified_workflow_action",
    priority: priorityEntry.priority,
    moduleKey: priorityEntry.moduleKey,
    reference: priorityEntry.reference,
    action: `Consolidate ${priorityEntry.moduleKey} work item ${priorityEntry.type} into the shared execution sequence.`,
    evidence: priorityEntry,
  };
}

function buildCoordinationAction(summary) {
  return {
    type: "workflow_coordination_action",
    priority: summary.highestPriorityCount > 0 ? "high" : "medium",
    action:
      summary.totalActions > 0
        ? "Use the unified workflow layer to sequence cross-module actions without collapsing module ownership."
        : "Keep the unified workflow layer ready to sequence cross-module actions as module outputs become available.",
    evidence: summary,
  };
}

function buildFoundationAction(foundationIssue) {
  if (!foundationIssue) return null;
  return {
    type: "fix_technical_foundation_first",
    priority: "high",
    moduleKey: "technical_seo_audit",
    reference: null,
    action: foundationIssue.action,
    evidence: { technicalHealthScore: foundationIssue.technicalHealthScore },
  };
}

function buildQuickWinAction(quickWinCluster) {
  if (!quickWinCluster) return null;
  return {
    type: "execute_quick_win_cluster",
    priority: "high",
    moduleKey: "unified_workflow_layer",
    reference: null,
    action: quickWinCluster.action,
    evidence: { keywordCount: quickWinCluster.keywordCount, keywords: quickWinCluster.keywords },
  };
}

function generateUnifiedWorkflowActions(analysisResult) {
  const actions = [];

  const foundationAction = buildFoundationAction(analysisResult.foundationIssue);
  if (foundationAction) actions.push(foundationAction);

  const quickWinAction = buildQuickWinAction(analysisResult.quickWinCluster);
  if (quickWinAction) actions.push(quickWinAction);

  const consolidatedActions = orderActionEntries(
    analysisResult.consolidatedPriorities
      .slice(0, 5)
      .map(buildConsolidatedAction),
  );
  actions.push(...consolidatedActions);

  actions.push(buildCoordinationAction(analysisResult.summary));
  return orderActionEntries(actions);
}

module.exports = {
  generateUnifiedWorkflowActions,
};
