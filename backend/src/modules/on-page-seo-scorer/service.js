const { getModuleDefinition } = require("../../core/moduleCatalog");
const { getModuleAdapter } = require("../../integrations/registry");
const { prioritizeOnPageActions } = require("./actions");
const { analyzeOnPage, normalizeOnPageInput, MODULE_KEY } = require("./analysis");
const { generateOnPageInsights } = require("./insights");
const { persistOnPageSeoRun } = require("./repository");

const definition = getModuleDefinition(MODULE_KEY);

async function resolveIntegrationInput(context = {}, moduleInput = {}) {
  const normalizedDirectInput = normalizeOnPageInput(moduleInput);
  if (normalizedDirectInput.pages.length > 0) {
    return { status: "direct_input", normalizedPayload: {} };
  }

  const adapter = getModuleAdapter(MODULE_KEY, context);
  if (!adapter) {
    return { status: "integration_not_connected", normalizedPayload: {} };
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

  return { status: "integration_not_connected", normalizedPayload: {} };
}

async function runOnPageSeoScorer(moduleInput = {}, context = {}) {
  const adapterResult = await resolveIntegrationInput(context, moduleInput);
  const mergedInput =
    adapterResult?.normalizedPayload && Object.keys(adapterResult.normalizedPayload).length > 0
      ? { ...moduleInput, ...adapterResult.normalizedPayload }
      : moduleInput;

  const normalizedInput = normalizeOnPageInput(mergedInput);
  const analysisResult = analyzeOnPage(normalizedInput);
  const insights = generateOnPageInsights(analysisResult);
  const { priorityPayload, actionsPayload } = prioritizeOnPageActions(insights, analysisResult);

  const persistence = await persistOnPageSeoRun(context, {
    productTarget: normalizedInput.productTarget,
    inputPayload: normalizedInput,
    analysisPayload: analysisResult,
    insightPayload: insights,
    priorityPayload,
    actionPayload: actionsPayload,
  });

  const flow = {
    input: normalizedInput,
    analysis: analysisResult,
    insight: insights,
    priority: priorityPayload,
    action: actionsPayload,
  };

  const hasActions = actionsPayload.length > 0;

  return {
    moduleKey: definition.moduleKey,
    displayName: definition.displayName,
    defaultActive: definition.defaultActive,
    initialState: definition.initialState,
    activeByDefault: definition.defaultActive,
    status: hasActions ? "completed" : "actions_empty",
    flow,
    intakeResult: {
      moduleKey: definition.moduleKey,
      status: normalizedInput.pages.length > 0 ? "accepted" : "accepted_without_pages",
      adapterStatus: adapterResult?.status || "direct_input",
      inputPayload: flow.input,
    },
    analysisResult: {
      moduleKey: definition.moduleKey,
      status: "analysis_complete",
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
      status: hasActions ? "actions_prioritized" : "actions_empty",
      priorityPayload: flow.priority,
      actionsPayload: flow.action,
      insightsPayload: flow.insight,
    },
    persistence,
    integrationStatus: adapterResult?.status || "direct_input",
  };
}

const onPageSeoScorerService = {
  definition,
  run: runOnPageSeoScorer,
};

module.exports = {
  moduleKey: MODULE_KEY,
  activeByDefault: true,
  onPageSeoScorerService,
  runOnPageSeoScorer,
  run: runOnPageSeoScorer,
};
