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

function generateUnifiedWorkflowActions(analysisResult) {
  const actions = orderActionEntries(
    analysisResult.consolidatedPriorities
    .slice(0, 5)
    .map(buildConsolidatedAction),
  );

  actions.push(buildCoordinationAction(analysisResult.summary));
  return orderActionEntries(actions);
}

module.exports = {
  generateUnifiedWorkflowActions,
};
