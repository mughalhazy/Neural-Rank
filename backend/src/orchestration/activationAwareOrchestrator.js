const {
  assertModuleCatalogIntegrity,
  getDefaultActivationState,
  listInactiveModules,
  resolveActivationState,
} = require("../core/activation");
const { buildModuleContext } = require("../core/runtimeContext");
const { getIntegrationRegistry } = require("../integrations/registry");
const {
  getRegisteredModuleKeys,
  getModuleService,
} = require("./serviceRegistry");

async function runActivationAwareFlow(
  moduleInputs = {},
  context = {},
  activationOverrides = {},
  options = {},
) {
  assertModuleCatalogIntegrity();

  const activationState = resolveActivationState(activationOverrides, options);
  const defaultState = getDefaultActivationState();
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
        activatedBy:
          activationState[moduleKey] && defaultState[moduleKey]
            ? "default_activation"
            : "explicit_activation_override",
      },
      activationState,
      defaultActivationState: defaultState,
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
  runActivationAwareFlow,
};
