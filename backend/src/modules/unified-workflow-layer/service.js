const { analyzeUnifiedWorkflowLayer, MODULE_KEY } = require("./analysis");
const { generateUnifiedWorkflowInsights } = require("./insights");
const { generateUnifiedWorkflowActions } = require("./actions");
const { resolveUnifiedWorkflowLayerRepository } = require("./repository");
const { getModuleAdapter } = require("../../integrations/registry");

function resolveIntegrationInput(context = {}) {
  const adapter = getModuleAdapter(MODULE_KEY, context);
  if (!adapter || typeof adapter.collect !== "function") {
    return {
      status: "integration_not_connected",
      moduleResults: context?.moduleResults || context?.orchestrationResults || [],
    };
  }

  return Promise.resolve(adapter.collect(context, {})).then((result) => ({
    ...result,
    moduleResults:
      Array.isArray(result?.moduleResults) && result.moduleResults.length > 0
        ? result.moduleResults
        : context?.moduleResults || context?.orchestrationResults || [],
  }));
}

async function persistRun(context, payload) {
  const repository = resolveUnifiedWorkflowLayerRepository(context);
  if (!repository || typeof repository.saveRun !== "function") {
    return null;
  }

  return repository.saveRun(payload);
}

async function runUnifiedWorkflowLayer(moduleInput = {}, context = {}) {
  const adapterResult = await Promise.resolve(resolveIntegrationInput(context));
  const analysisResult = analyzeUnifiedWorkflowLayer(moduleInput, adapterResult);
  const insights = generateUnifiedWorkflowInsights(analysisResult);
  const actions = generateUnifiedWorkflowActions(analysisResult);
  const priorityPayload = analysisResult.consolidatedPriorities;

  await persistRun(context, {
    productTarget: analysisResult.normalizedInput.productTarget,
    inputPayload: analysisResult.normalizedInput,
    analysisPayload: analysisResult,
    insightPayload: insights,
    priorityPayload,
    actionPayload: actions,
  });

  return {
    moduleKey: MODULE_KEY,
    status: "completed",
    activeByDefault: true,
    flow: {
      input: analysisResult.normalizedInput,
      analysis: analysisResult,
      insight: insights,
      priority: priorityPayload,
      action: actions,
    },
    integrationStatus: adapterResult?.status || "direct_input",
  };
}

function createUnifiedWorkflowLayerService() {
  return {
    moduleKey: MODULE_KEY,
    activeByDefault: true,
    run: runUnifiedWorkflowLayer,
  };
}

module.exports = {
  moduleKey: MODULE_KEY,
  activeByDefault: true,
  createUnifiedWorkflowLayerService,
  runUnifiedWorkflowLayer,
  run: runUnifiedWorkflowLayer,
};
