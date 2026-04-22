const MODULE_KEY = "unified_workflow_layer";
const {
  getPriorityScore,
  normalizePriority,
  orderPriorityEntries,
} = require("../../core/prioritization");

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeModuleResult(result, index) {
  const moduleKey =
    normalizeText(result?.moduleKey) ||
    normalizeText(result?.module) ||
    `module_${index + 1}`;

  const insights = Array.isArray(result?.flow?.insight)
    ? result.flow.insight
    : Array.isArray(result?.insights)
      ? result.insights
      : [];
  const priorities = Array.isArray(result?.flow?.priority)
    ? result.flow.priority
    : Array.isArray(result?.priorities)
      ? result.priorities
      : [];
  const actions = Array.isArray(result?.flow?.action)
    ? result.flow.action
    : Array.isArray(result?.actions)
      ? result.actions
      : [];

  return {
    moduleKey,
    status: normalizeText(result?.status) || "completed",
    insights,
    priorities,
    actions,
  };
}

function normalizeInput(moduleInput = {}, adapterResult = {}) {
  const sourceResults = Array.isArray(moduleInput.moduleResults)
    ? moduleInput.moduleResults
    : Array.isArray(moduleInput.orchestrationResults)
      ? moduleInput.orchestrationResults
      : Array.isArray(adapterResult.moduleResults)
        ? adapterResult.moduleResults
        : [];

  return {
    moduleKey: MODULE_KEY,
    productTarget: {
      targetRef:
        moduleInput?.targetRef ||
        moduleInput?.websiteUrl ||
        moduleInput?.appId ||
        moduleInput?.appStoreUrl ||
        moduleInput?.playStoreUrl ||
        "unknown_target",
      targetType: moduleInput?.targetType || "product_target",
      websiteUrl: moduleInput?.websiteUrl || null,
      appId: moduleInput?.appId || null,
      appStoreUrl: moduleInput?.appStoreUrl || null,
      playStoreUrl: moduleInput?.playStoreUrl || null,
    },
    moduleResults: sourceResults.map(normalizeModuleResult),
  };
}

function priorityWeight(priority) {
  return getPriorityScore(normalizePriority(priority));
}

function summarizeModule(moduleResult) {
  const highestPriority = orderPriorityEntries(
    moduleResult.priorities.map((entry) => ({
      moduleKey: moduleResult.moduleKey,
      type: entry?.type || "priority_item",
      priority: entry?.priority || "low",
      reference:
        entry?.clusterKey ||
        entry?.sectionRef ||
        entry?.assetRef ||
        entry?.competitorRef ||
        entry?.keyword ||
        null,
    })),
  )
    .map((entry) => entry.priority)
    .sort((left, right) => priorityWeight(right) - priorityWeight(left))[0] || "low";

  return {
    moduleKey: moduleResult.moduleKey,
    insightCount: moduleResult.insights.length,
    priorityCount: moduleResult.priorities.length,
    actionCount: moduleResult.actions.length,
    highestPriority,
  };
}

function consolidatePriorities(moduleResults) {
  return orderPriorityEntries(
    moduleResults
    .flatMap((moduleResult) =>
      moduleResult.priorities.map((priorityEntry) => ({
        moduleKey: moduleResult.moduleKey,
        type: priorityEntry?.type || "priority_item",
        priority: priorityEntry?.priority || "low",
        reference:
          priorityEntry?.clusterKey ||
          priorityEntry?.sectionRef ||
          priorityEntry?.assetRef ||
          priorityEntry?.competitorRef ||
          priorityEntry?.keyword ||
          null,
      })),
    ),
  );
}

function consolidateActions(moduleResults) {
  return moduleResults.flatMap((moduleResult) =>
    moduleResult.actions.map((actionEntry) => ({
      moduleKey: moduleResult.moduleKey,
      type: actionEntry?.type || "action_item",
      priority: actionEntry?.priority || "low",
      action: normalizeText(actionEntry?.action) || "No action text provided.",
      reference:
        actionEntry?.clusterKey ||
        actionEntry?.sectionRef ||
        actionEntry?.assetRef ||
        actionEntry?.competitorRef ||
        actionEntry?.keyword ||
        null,
    })),
  );
}

function analyzeUnifiedWorkflowLayer(moduleInput = {}, adapterResult = {}) {
  const normalizedInput = normalizeInput(moduleInput, adapterResult);
  const moduleSummaries = normalizedInput.moduleResults.map(summarizeModule);
  const consolidatedPriorities = consolidatePriorities(normalizedInput.moduleResults);
  const consolidatedActions = consolidateActions(normalizedInput.moduleResults);

  return {
    normalizedInput,
    moduleSummaries,
    consolidatedPriorities,
    consolidatedActions,
    summary: {
      moduleCount: normalizedInput.moduleResults.length,
      modulesWithActions: moduleSummaries.filter((item) => item.actionCount > 0).length,
      totalInsights: moduleSummaries.reduce((total, item) => total + item.insightCount, 0),
      totalActions: moduleSummaries.reduce((total, item) => total + item.actionCount, 0),
      highestPriorityCount: consolidatedPriorities.filter(
        (item) => item.priority === "high",
      ).length,
    },
  };
}

module.exports = {
  MODULE_KEY,
  analyzeUnifiedWorkflowLayer,
};
