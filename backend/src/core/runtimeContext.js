function moduleKeyToContextKey(moduleKey = "") {
  return String(moduleKey)
    .split("_")
    .filter(Boolean)
    .map((segment, index) =>
      index === 0
        ? segment
        : `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`,
    )
    .join("");
}

function createAliasMap(source = {}, moduleKeys = []) {
  return moduleKeys.reduce((accumulator, moduleKey) => {
    const contextKey = moduleKeyToContextKey(moduleKey);

    if (source[moduleKey] !== undefined) {
      accumulator[moduleKey] = source[moduleKey];
      accumulator[contextKey] = source[moduleKey];
      return accumulator;
    }

    if (source[contextKey] !== undefined) {
      accumulator[moduleKey] = source[contextKey];
      accumulator[contextKey] = source[contextKey];
      return accumulator;
    }

    return accumulator;
  }, {});
}

function buildModuleContext({
  moduleKey,
  baseContext = {},
  activationState = {},
  defaultActivationState = {},
  moduleResults = [],
  integrations = {},
  repositories = {},
}) {
  const moduleKeys = Object.keys(activationState);

  return {
    ...baseContext,
    activationState,
    defaultActivationState,
    moduleResults,
    orchestrationResults: moduleResults,
    integrations: createAliasMap(integrations, moduleKeys),
    providerAdapters: createAliasMap(integrations, moduleKeys),
    repositories: createAliasMap(repositories, moduleKeys),
    currentModuleKey: moduleKey,
  };
}

module.exports = {
  buildModuleContext,
  moduleKeyToContextKey,
};
