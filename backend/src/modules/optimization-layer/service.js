const { analyzeOptimizationLayer, MODULE_KEY } = require("./analysis");
const { generateOptimizationInsights } = require("./insights");
const { generateOptimizationActions } = require("./actions");
const { resolveOptimizationLayerRepository } = require("./repository");
const { getModuleAdapter } = require("../../integrations/registry");

function resolveIntegrationInput(context = {}) {
  const adapter = getModuleAdapter(MODULE_KEY, context);
  if (!adapter || typeof adapter.collect !== "function") {
    return {
      status: "integration_not_connected",
      sections: [],
      targetKeywords: [],
    };
  }

  return adapter.collect(context, {});
}

async function persistRun(context, payload) {
  const repository = resolveOptimizationLayerRepository(context);
  if (!repository || typeof repository.saveRun !== "function") {
    return null;
  }

  return repository.saveRun(payload);
}

async function runOptimizationLayer(moduleInput = {}, context = {}) {
  const adapterResult = await Promise.resolve(resolveIntegrationInput(context));
  const analysisResult = analyzeOptimizationLayer(moduleInput, adapterResult);
  const insights = generateOptimizationInsights(analysisResult);
  const actions = generateOptimizationActions(analysisResult);
  const priorityPayload = actions.map((action) => ({
    type: action.type,
    priority: action.priority,
    sectionRef: action.sectionRef || null,
  }));

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

function createOptimizationLayerService() {
  return {
    moduleKey: MODULE_KEY,
    activeByDefault: true,
    run: runOptimizationLayer,
  };
}

module.exports = {
  moduleKey: MODULE_KEY,
  activeByDefault: true,
  createOptimizationLayerService,
  runOptimizationLayer,
  run: runOptimizationLayer,
};
