const {
  assertModuleCatalogIntegrity,
  getDefaultActivationState,
  listInactiveModules,
} = require("../core/activation");
const { buildModuleContext } = require("../core/runtimeContext");
const { getIntegrationRegistry } = require("../integrations/registry");
const {
  getRegisteredModuleKeys,
  getModuleService,
} = require("./serviceRegistry");

async function runDefaultMvpFlow(moduleInputs = {}, context = {}) {
  assertModuleCatalogIntegrity();

  const activationState = getDefaultActivationState();
  const integrations = getIntegrationRegistry(context);
  const repositories = context.repositories || {};
  const results = {};
  const moduleResults = [];

  for (const moduleKey of getRegisteredModuleKeys()) {
    if (activationState[moduleKey] !== true) {
      continue;
    }

    const service = getModuleService(moduleKey);
    if (!service || typeof service.run !== "function") {
      continue;
    }

    const moduleInput = moduleInputs[moduleKey] || {};
    const moduleContext = buildModuleContext({
      moduleKey,
      baseContext: {
        ...context,
        activatedBy: "default_backend_orchestrator",
      },
      activationState,
      defaultActivationState: activationState,
      moduleResults,
      integrations,
      repositories,
    });

    results[moduleKey] = await service.run(moduleInput, moduleContext);
    moduleResults.push(results[moduleKey]);
  }

  return {
    activationState,
    inactiveModules: listInactiveModules(activationState),
    moduleResults,
    results,
  };
}

module.exports = {
  runDefaultBackendFlow: runDefaultMvpFlow,
  runDefaultMvpFlow,
};
