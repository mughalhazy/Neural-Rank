const {
  analyzeCreativeMessagingLayer,
  MODULE_KEY,
} = require("./analysis");
const {
  generateCreativeMessagingInsights,
} = require("./insights");
const {
  generateCreativeMessagingActions,
} = require("./actions");
const {
  resolveCreativeMessagingLayerRepository,
} = require("./repository");
const { getModuleAdapter } = require("../../integrations/registry");

function resolveIntegrationInput(context = {}) {
  const adapter = getModuleAdapter(MODULE_KEY, context);
  if (!adapter || typeof adapter.collect !== "function") {
    return {
      status: "integration_not_connected",
      assets: [],
      targetThemes: [],
    };
  }

  return adapter.collect(context, {});
}

async function persistRun(context, payload) {
  const repository = resolveCreativeMessagingLayerRepository(context);
  if (!repository || typeof repository.saveRun !== "function") {
    return null;
  }

  return repository.saveRun(payload);
}

async function runCreativeMessagingLayer(moduleInput = {}, context = {}) {
  const adapterResult = await Promise.resolve(resolveIntegrationInput(context));
  const analysisResult = analyzeCreativeMessagingLayer(moduleInput, adapterResult);
  const insights = generateCreativeMessagingInsights(analysisResult);
  const actions = generateCreativeMessagingActions(analysisResult);

  await persistRun(context, {
    productTarget: analysisResult.normalizedInput.productTarget,
    inputPayload: analysisResult.normalizedInput,
    analysisPayload: analysisResult,
    insightPayload: insights,
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
      priority: actions.map((action) => ({
        type: action.type,
        priority: action.priority,
        assetRef: action.assetRef || null,
      })),
      action: actions,
    },
    integrationStatus: adapterResult?.status || "direct_input",
  };
}

function createCreativeMessagingLayerService() {
  return {
    moduleKey: MODULE_KEY,
    activeByDefault: true,
    run: runCreativeMessagingLayer,
  };
}

module.exports = {
  moduleKey: MODULE_KEY,
  activeByDefault: true,
  createCreativeMessagingLayerService,
  runCreativeMessagingLayer,
  run: runCreativeMessagingLayer,
};
