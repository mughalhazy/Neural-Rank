const { getModuleDefinition } = require("../../core/moduleCatalog");
const { getModuleAdapter } = require("../../integrations/registry");
const { prioritizeRankActions } = require("./actions");
const { analyzeRankInput, normalizeRankInput, MODULE_KEY } = require("./analysis");
const { generateRankInsights } = require("./insights");
const { persistRankTrackingRun } = require("./repository");

const definition = getModuleDefinition(MODULE_KEY);

async function resolveIntegrationInput(context = {}, moduleInput = {}) {
  const normalizedDirectInput = normalizeRankInput(moduleInput);
  if (normalizedDirectInput.rankEntries.length > 0) {
    return {
      status: "direct_input",
      normalizedPayload: {},
    };
  }

  const adapter = getModuleAdapter(MODULE_KEY, context);
  if (!adapter) {
    return {
      status: "integration_not_connected",
      normalizedPayload: {},
    };
  }

  if (typeof adapter.normalizeInput === "function") {
    return adapter.normalizeInput(context, moduleInput.adapterRequest || {});
  }

  if (typeof adapter.collect === "function") {
    const result = await adapter.collect(context, moduleInput.adapterRequest || {});
    return {
      ...result,
      normalizedPayload: result?.normalizedPayload || {},
    };
  }

  return {
    status: "integration_not_connected",
    normalizedPayload: {},
  };
}

async function runRankTracking(moduleInput = {}, context = {}) {
  const adapterResult = await resolveIntegrationInput(context, moduleInput);
  const mergedInput =
    adapterResult?.normalizedPayload && Object.keys(adapterResult.normalizedPayload).length > 0
      ? { ...moduleInput, ...adapterResult.normalizedPayload }
      : moduleInput;
  const analysisResult = analyzeRankInput(normalizeRankInput(mergedInput));
  const insights = generateRankInsights(analysisResult);
  const { priorityPayload, actionsPayload } = prioritizeRankActions(insights);

  const persistence = await persistRankTrackingRun(context, {
    productTarget: analysisResult.normalizedInput.productTarget,
    inputPayload: analysisResult.normalizedInput,
    analysisPayload: analysisResult,
    insightPayload: insights,
    actionPayload: actionsPayload,
  });

  const flow = {
    input: analysisResult.normalizedInput,
    analysis: analysisResult,
    insight: insights,
    priority: priorityPayload,
    action: actionsPayload,
  };

  return {
    moduleKey: definition.moduleKey,
    displayName: definition.displayName,
    defaultActive: true,
    initialState: definition.initialState,
    activeByDefault: true,
    status: actionsPayload.length > 0 ? "completed" : "actions_empty",
    flow,
    intakeResult: {
      moduleKey: definition.moduleKey,
      status:
        flow.input.rankEntries.length > 0
          ? "accepted"
          : "accepted_without_rank_entries",
      adapterStatus: adapterResult?.status || "direct_input",
      inputPayload: flow.input,
    },
    analysisResult: {
      moduleKey: definition.moduleKey,
      status:
        flow.analysis.rankEntryCount > 0 ? "analysis_complete" : "analysis_empty",
      analysisPayload: flow.analysis,
    },
    insightResult: {
      moduleKey: definition.moduleKey,
      status: insights.length > 0 ? "insights_generated" : "insights_empty",
      insightsPayload: flow.insight,
      analysisPayload: flow.analysis,
    },
    actionResult: {
      moduleKey: definition.moduleKey,
      status: actionsPayload.length > 0 ? "actions_prioritized" : "actions_empty",
      priorityPayload: flow.priority,
      actionsPayload: flow.action,
      insightsPayload: flow.insight,
    },
    persistence,
    integrationStatus: adapterResult?.status || "direct_input",
  };
}

const rankTrackingService = {
  definition,
  run: runRankTracking,
};

module.exports = {
  moduleKey: MODULE_KEY,
  activeByDefault: true,
  rankTrackingService,
  runRankTracking,
  run: runRankTracking,
};
