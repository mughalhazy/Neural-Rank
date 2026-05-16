const { moduleCatalog = [] } = require("./moduleCatalog");

const DEFAULT_ACTIVE_MODULES = new Set([
  "review_analysis",
  "content_listing_insights",
  "keyword_analysis",
  "rank_tracking",
  "competitor_analysis",
  "optimization_layer",
  "creative_messaging_layer",
  "unified_workflow_layer",
  "technical_seo_audit",
  "on_page_seo_scorer",
  "backlink_intelligence",
  "eeat_signals",
  "search_intent_classifier",
  "serp_feature_analyzer",
  "topical_authority",
  "site_architecture",
  "analytics_integration",
]);

const BUILT_BUT_INACTIVE_MODULES = new Set([
  "local_seo",
]);

function getCatalogEntries() {
  return Array.isArray(moduleCatalog) ? moduleCatalog : [];
}

function getKnownModuleKeys() {
  return getCatalogEntries().map((entry) => entry.moduleKey);
}

function assertModuleCatalogIntegrity() {
  const knownModuleKeys = new Set(getKnownModuleKeys());
  const missingActiveModules = [...DEFAULT_ACTIVE_MODULES].filter(
    (moduleKey) => !knownModuleKeys.has(moduleKey),
  );
  const missingInactiveModules = [...BUILT_BUT_INACTIVE_MODULES].filter(
    (moduleKey) => !knownModuleKeys.has(moduleKey),
  );

  if (missingActiveModules.length > 0 || missingInactiveModules.length > 0) {
    throw new Error(
      [
        "Module catalog does not match the frozen activation model.",
        missingActiveModules.length > 0
          ? `Missing default-active modules: ${missingActiveModules.join(", ")}.`
          : null,
        missingInactiveModules.length > 0
          ? `Missing built-but-inactive modules: ${missingInactiveModules.join(", ")}.`
          : null,
      ]
        .filter(Boolean)
        .join(" "),
    );
  }
}

function getDefaultActivationState() {
  assertModuleCatalogIntegrity();

  return getCatalogEntries().reduce((state, entry) => {
    state[entry.moduleKey] = DEFAULT_ACTIVE_MODULES.has(entry.moduleKey);
    return state;
  }, {});
}

function listModulesByActivation() {
  assertModuleCatalogIntegrity();

  return {
    active: getKnownModuleKeys().filter((moduleKey) =>
      DEFAULT_ACTIVE_MODULES.has(moduleKey),
    ),
    inactive: getKnownModuleKeys().filter((moduleKey) =>
      BUILT_BUT_INACTIVE_MODULES.has(moduleKey),
    ),
  };
}

function resolveActivationState(overrides = {}, options = {}) {
  const defaultState = getDefaultActivationState();
  const allowInactiveActivation = options.allowInactiveActivation === true;
  const resolvedState = { ...defaultState };

  Object.entries(overrides || {}).forEach(([moduleKey, requestedState]) => {
    if (!(moduleKey in resolvedState)) {
      return;
    }

    if (requestedState !== true && requestedState !== false) {
      return;
    }

    if (BUILT_BUT_INACTIVE_MODULES.has(moduleKey) && requestedState === true) {
      resolvedState[moduleKey] = allowInactiveActivation;
      return;
    }

    resolvedState[moduleKey] = requestedState;
  });

  return resolvedState;
}

function isModuleActive(moduleKey, activationState) {
  const state = activationState || getDefaultActivationState();
  return state[moduleKey] === true;
}

function canRunModule(moduleKey, activationState) {
  const knownModuleKeys = new Set(getKnownModuleKeys());
  if (!knownModuleKeys.has(moduleKey)) {
    return false;
  }

  return isModuleActive(moduleKey, activationState);
}

function listInactiveModules(activationState) {
  const state = activationState || getDefaultActivationState();
  return Object.entries(state)
    .filter(([, isActive]) => !isActive)
    .map(([moduleKey]) => moduleKey);
}

module.exports = {
  BUILT_BUT_INACTIVE_MODULES,
  DEFAULT_ACTIVE_MODULES,
  MVP_ACTIVE_MODULES: DEFAULT_ACTIVE_MODULES,
  assertModuleCatalogIntegrity,
  canRunModule,
  getDefaultActivationState,
  isModuleActive,
  listInactiveModules,
  listModulesByActivation,
  resolveActivationState,
};
