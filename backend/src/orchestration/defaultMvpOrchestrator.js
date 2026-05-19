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

const MODULE_TIMEOUT_MS = Number(process.env.MODULE_TIMEOUT_MS) || 10_000;

function timeoutReject(ms, moduleKey) {
  return new Promise((_, reject) => {
    const timer = setTimeout(() => {
      const err = new Error("module_timeout");
      err.code = "module_timeout";
      err.moduleKey = moduleKey;
      reject(err);
    }, ms);
    // Allow Node to exit even if this timer is pending.
    if (timer.unref) timer.unref();
  });
}

async function runModuleSafe(service, input, ctx, moduleKey) {
  try {
    return await Promise.race([service.run(input, ctx), timeoutReject(MODULE_TIMEOUT_MS, moduleKey)]);
  } catch (err) {
    return { status: err.code === "module_timeout" ? "timeout" : "error", moduleKey, reason: String(err) };
  }
}

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

    results[moduleKey] = await runModuleSafe(service, moduleInput, moduleContext, moduleKey);
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
  runModuleSafe,
};
