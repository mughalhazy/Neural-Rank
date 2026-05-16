const { getModuleDefinition } = require("../../core/moduleCatalog");
const { getModuleAdapter } = require("../../integrations/registry");
const { prioritizeBacklinkActions } = require("./actions");
const { analyzeBacklinks, normalizeBacklinkInput, MODULE_KEY } = require("./analysis");
const { generateBacklinkInsights } = require("./insights");
const { persistBacklinkIntelligenceRun } = require("./repository");

const definition = getModuleDefinition(MODULE_KEY);

async function resolveIntegrationInput(context = {}, moduleInput = {}) {
  const normalized = normalizeBacklinkInput(moduleInput);
  if (normalized.backlinks.length > 0 || normalized.referringDomains.length > 0) {
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
    return { ...result, normalizedPayload: result?.normalizedPayload || {} };
  }

  return { status: "integration_not_connected", normalizedPayload: {} };
}

async function runBacklinkIntelligence(moduleInput = {}, context = {}) {
  const adapterResult = await resolveIntegrationInput(context, moduleInput);
  const mergedInput =
    adapterResult?.normalizedPayload && Object.keys(adapterResult.normalizedPayload).length > 0
      ? { ...moduleInput, ...adapterResult.normalizedPayload }
      : moduleInput;

  const normalizedInput = normalizeBacklinkInput(mergedInput);
  const analysisResult = analyzeBacklinks(normalizedInput);
  const insights = generateBacklinkInsights(analysisResult);
  const { priorityPayload, actionsPayload } = prioritizeBacklinkActions(insights);

  const persistence = await persistBacklinkIntelligenceRun(context, {
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
      status: normalizedInput.backlinks.length > 0 ? "accepted" : "accepted_without_backlinks",
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

const backlinkIntelligenceService = {
  definition,
  run: runBacklinkIntelligence,
};

module.exports = {
  moduleKey: MODULE_KEY,
  activeByDefault: true,
  backlinkIntelligenceService,
  runBacklinkIntelligence,
  run: runBacklinkIntelligence,
};
