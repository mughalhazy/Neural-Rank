const { getModuleDefinition } = require("../../core/moduleCatalog");
const { getModuleAdapter } = require("../../integrations/registry");
const { prioritizeLocalSeoActions } = require("./actions");
const { analyzeLocalSeo, normalizeLocalSeoInput, MODULE_KEY } = require("./analysis");
const { generateLocalSeoInsights } = require("./insights");
const { persistLocalSeoRun } = require("./repository");

const definition = getModuleDefinition(MODULE_KEY);

async function resolveIntegrationInput(context = {}, moduleInput = {}) {
  const normalized = normalizeLocalSeoInput(moduleInput);
  const hasData = normalized.businessName || normalized.citations.length > 0 || normalized.localKeywords.length > 0;
  if (hasData) return { status: "direct_input", normalizedPayload: {} };

  const adapter = getModuleAdapter(MODULE_KEY, context);
  if (!adapter) return { status: "integration_not_connected", normalizedPayload: {} };

  if (typeof adapter.normalizeInput === "function") {
    return adapter.normalizeInput(context, moduleInput.adapterRequest || {});
  }

  if (typeof adapter.collect === "function") {
    const result = await adapter.collect(context, moduleInput.adapterRequest || {});
    return { ...result, normalizedPayload: result?.normalizedPayload || {} };
  }

  return { status: "integration_not_connected", normalizedPayload: {} };
}

async function runLocalSeo(moduleInput = {}, context = {}) {
  const adapterResult = await resolveIntegrationInput(context, moduleInput);
  const mergedInput =
    adapterResult?.normalizedPayload && Object.keys(adapterResult.normalizedPayload).length > 0
      ? { ...moduleInput, ...adapterResult.normalizedPayload }
      : moduleInput;

  const normalizedInput = normalizeLocalSeoInput(mergedInput);
  const analysisResult = analyzeLocalSeo(normalizedInput);
  const insights = generateLocalSeoInsights(analysisResult);
  const { priorityPayload, actionsPayload } = prioritizeLocalSeoActions(insights);

  const persistence = await persistLocalSeoRun(context, {
    productTarget: normalizedInput.productTarget,
    inputPayload: normalizedInput,
    analysisPayload: analysisResult,
    insightPayload: insights,
    priorityPayload,
    actionPayload: actionsPayload,
  });

  const flow = { input: normalizedInput, analysis: analysisResult, insight: insights, priority: priorityPayload, action: actionsPayload };
  const hasActions = actionsPayload.length > 0;

  return {
    moduleKey: definition.moduleKey,
    displayName: definition.displayName,
    defaultActive: definition.defaultActive,
    initialState: definition.initialState,
    activeByDefault: definition.defaultActive,
    status: hasActions ? "completed" : "actions_empty",
    flow,
    intakeResult: { moduleKey: definition.moduleKey, status: normalizedInput.businessName ? "accepted" : "accepted_without_business_data", adapterStatus: adapterResult?.status || "direct_input", inputPayload: flow.input },
    analysisResult: { moduleKey: definition.moduleKey, status: "analysis_complete", analysisPayload: flow.analysis },
    insightResult: { moduleKey: definition.moduleKey, status: insights.length > 0 ? "insights_generated" : "insights_empty", insightsPayload: flow.insight, analysisPayload: flow.analysis },
    actionResult: { moduleKey: definition.moduleKey, status: hasActions ? "actions_prioritized" : "actions_empty", priorityPayload: flow.priority, actionsPayload: flow.action, insightsPayload: flow.insight },
    persistence,
    integrationStatus: adapterResult?.status || "direct_input",
  };
}

const localSeoService = { definition, run: runLocalSeo };

module.exports = {
  moduleKey: MODULE_KEY,
  activeByDefault: false,
  localSeoService,
  runLocalSeo,
  run: runLocalSeo,
};
