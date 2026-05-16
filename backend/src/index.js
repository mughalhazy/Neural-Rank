const { moduleCatalog } = require("./core/moduleCatalog");
const {
  BUILT_BUT_INACTIVE_MODULES,
  DEFAULT_ACTIVE_MODULES,
  MVP_ACTIVE_MODULES,
  canRunModule,
  getDefaultActivationState,
  listInactiveModules,
  listModulesByActivation,
  resolveActivationState,
} = require("./core/activation");
const {
  normalizePriority,
  orderActionEntries,
  orderPriorityEntries,
} = require("./core/prioritization");
const { normalizeProductTarget } = require("./core/targeting");
const { buildModuleContext } = require("./core/runtimeContext");
const { getDomainBoundaryMap, getDomainServices } = require("./domains");
const { getIntegrationRegistry, getModuleAdapter } = require("./integrations/registry");
const {
  runDefaultBackendFlow,
  runDefaultMvpFlow,
} = require("./orchestration/defaultMvpOrchestrator");
const { runActivationAwareFlow } = require("./orchestration/activationAwareOrchestrator");
const {
  getModuleService,
  getRegisteredModuleKeys,
  getServiceRegistry,
} = require("./orchestration/serviceRegistry");

module.exports = {
  moduleCatalog,
  DEFAULT_ACTIVE_MODULES,
  MVP_ACTIVE_MODULES,
  BUILT_BUT_INACTIVE_MODULES,
  buildModuleContext,
  canRunModule,
  getDomainBoundaryMap,
  getDomainServices,
  getDefaultActivationState,
  getIntegrationRegistry,
  getModuleAdapter,
  getModuleService,
  getRegisteredModuleKeys,
  getServiceRegistry,
  listInactiveModules,
  listModulesByActivation,
  normalizeProductTarget,
  normalizePriority,
  orderActionEntries,
  orderPriorityEntries,
  resolveActivationState,
  runActivationAwareFlow,
  runDefaultBackendFlow,
  runDefaultMvpFlow,
};
