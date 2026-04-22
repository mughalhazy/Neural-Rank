const { analyzeCompetitorLandscape, MODULE_KEY } = require("./analysis");
const { generateCompetitorInsights } = require("./insights");
const { generateCompetitorActions } = require("./actions");
const { resolveCompetitorAnalysisRepository } = require("./repository");
const { getModuleAdapter } = require("../../integrations/registry");

function resolveIntegrationInput(context = {}) {
  const adapter = getModuleAdapter(MODULE_KEY, context);
  if (!adapter || typeof adapter.collect !== "function") {
    return {
      status: "integration_not_connected",
      competitors: [],
    };
  }

  return adapter.collect(context, {});
}

async function persistRun(context, payload) {
  const repository = resolveCompetitorAnalysisRepository(context);

  if (!repository || typeof repository.saveRun !== "function") {
    return null;
  }

  return repository.saveRun(payload);
}

async function runCompetitorAnalysis(moduleInput = {}, context = {}) {
  const adapterResult = await Promise.resolve(resolveIntegrationInput(context));
  const analysisResult = analyzeCompetitorLandscape(moduleInput, adapterResult);
  const insights = generateCompetitorInsights(analysisResult);
  const actions = generateCompetitorActions(analysisResult);

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
        competitorRef: action.competitorRef || null,
      })),
      action: actions,
    },
    integrationStatus: adapterResult?.status || "direct_input",
  };
}

function createCompetitorAnalysisService() {
  return {
    moduleKey: MODULE_KEY,
    activeByDefault: true,
    run: runCompetitorAnalysis,
  };
}

module.exports = {
  moduleKey: MODULE_KEY,
  activeByDefault: true,
  createCompetitorAnalysisService,
  runCompetitorAnalysis,
  run: runCompetitorAnalysis,
};
