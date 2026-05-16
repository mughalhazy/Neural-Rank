const { getModuleDefinition } = require("../../core/moduleCatalog");
const { getModuleAdapter } = require("../../integrations/registry");
const { prioritizeReviewActions } = require("./actions");
const { analyzeReviewLandscape, MODULE_KEY } = require("./analysis");
const { generateReviewInsights } = require("./insights");
const { persistReviewAnalysisRun } = require("./repository");

const definition = getModuleDefinition(MODULE_KEY);

async function resolveIntegrationInput(context = {}, moduleInput = {}) {
  if (Array.isArray(moduleInput.reviews) && moduleInput.reviews.length > 0) {
    return {
      status: "direct_input",
      normalizedPayload: {
        reviews: [],
      },
    };
  }

  const adapter = getModuleAdapter(MODULE_KEY, context);
  if (!adapter) {
    return {
      status: "integration_not_connected",
      normalizedPayload: {
        reviews: [],
      },
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
    normalizedPayload: {
      reviews: [],
    },
  };
}

async function runReviewAnalysis(moduleInput = {}, context = {}) {
  const adapterResult = await resolveIntegrationInput(context, moduleInput);
  const analysisResult = analyzeReviewLandscape(moduleInput, adapterResult);
  const insights = generateReviewInsights(analysisResult);
  const { priorityPayload, actionsPayload } = prioritizeReviewActions(insights);

  const persistence = await persistReviewAnalysisRun(context, {
    productTarget: analysisResult.normalizedInput.productTarget,
    inputPayload: analysisResult.normalizedInput,
    analysisPayload: analysisResult,
    insightPayload: insights,
    priorityPayload,
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
        analysisResult.normalizedInput.reviews.length > 0
          ? "accepted"
          : "accepted_without_reviews",
      adapterStatus: adapterResult?.status || "direct_input",
      inputPayload: flow.input,
    },
    analysisResult: {
      moduleKey: definition.moduleKey,
      status:
        analysisResult.reviewCount > 0 ? "analysis_complete" : "analysis_empty",
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

const reviewAnalysisService = {
  definition,
  run: runReviewAnalysis,
};

module.exports = {
  moduleKey: MODULE_KEY,
  activeByDefault: true,
  reviewAnalysisService,
  runReviewAnalysis,
  run: runReviewAnalysis,
};
