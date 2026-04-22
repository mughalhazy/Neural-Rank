const { getModuleDefinition } = require("../../core/moduleCatalog");
const { getModuleAdapter } = require("../../integrations/registry");
const { prioritizeContentListingActions } = require("./actions");
const { analyzeContentListingInput, normalizeContentInput, MODULE_KEY } = require("./analysis");
const { generateContentListingInsights } = require("./insights");
const { persistContentListingInsightsRun } = require("./repository");

const definition = getModuleDefinition(MODULE_KEY);

async function resolveIntegrationInput(context = {}, moduleInput = {}) {
  const normalizedDirectInput = normalizeContentInput(moduleInput);
  const hasDirectStructuredInput =
    Boolean(normalizedDirectInput.content.combinedText) ||
    Boolean(normalizedDirectInput.listing.combinedText);

  if (hasDirectStructuredInput) {
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

async function runContentListingInsights(moduleInput = {}, context = {}) {
  const adapterResult = await resolveIntegrationInput(context, moduleInput);
  const mergedInput =
    adapterResult?.normalizedPayload && Object.keys(adapterResult.normalizedPayload).length > 0
      ? { ...moduleInput, ...adapterResult.normalizedPayload }
      : moduleInput;
  const analysisResult = analyzeContentListingInput(normalizeContentInput(mergedInput));
  const insights = generateContentListingInsights(analysisResult);
  const { priorityPayload, actionsPayload } = prioritizeContentListingActions(insights);

  const persistence = await persistContentListingInsightsRun(context, {
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
        flow.input.content.combinedText || flow.input.listing.combinedText
          ? "accepted"
          : "accepted_without_content",
      adapterStatus: adapterResult?.status || "direct_input",
      inputPayload: flow.input,
    },
    analysisResult: {
      moduleKey: definition.moduleKey,
      status:
        flow.analysis.contentAnalysis.present || flow.analysis.listingAnalysis.present
          ? "analysis_complete"
          : "analysis_empty",
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

const contentListingInsightsService = {
  definition,
  run: runContentListingInsights,
};

module.exports = {
  moduleKey: MODULE_KEY,
  activeByDefault: true,
  contentListingInsightsService,
  runContentListingInsights,
  run: runContentListingInsights,
};
