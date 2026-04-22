const { integrationCatalog = {} } = require("./catalog");
const { createProviderAdapter } = require("../core/createProviderAdapter");

function resolveIntegrationSource(context = {}) {
  return (
    context.integrationOverrides ||
    context.integrations ||
    context.providerAdapters ||
    {}
  );
}

function normalizeRuntimeAdapter(moduleKey, runtimeAdapter, catalogEntry = {}) {
  if (!runtimeAdapter) {
    return null;
  }

  if (typeof runtimeAdapter.collect === "function") {
    return {
      moduleKey,
      adapterName:
        runtimeAdapter.adapterName ||
        catalogEntry.adapterName ||
        `${moduleKey}RuntimeAdapter`,
      supportsCollection: true,
      isImplemented: true,
      async collect(...args) {
        return runtimeAdapter.collect(...args);
      },
      async normalizeInput(context = {}, request = {}) {
        if (typeof runtimeAdapter.normalizeInput === "function") {
          return runtimeAdapter.normalizeInput(context, request);
        }

        const result = await runtimeAdapter.collect(context, request);
        return {
          ...result,
          normalizedPayload: result?.normalizedPayload || {},
        };
      },
    };
  }

  if (typeof runtimeAdapter.normalizeInput === "function") {
    return {
      moduleKey,
      adapterName:
        runtimeAdapter.adapterName ||
        catalogEntry.adapterName ||
        `${moduleKey}RuntimeAdapter`,
      supportsCollection: true,
      isImplemented: true,
      async collect(context = {}, request = {}) {
        const result = await runtimeAdapter.normalizeInput(context, request);
        return {
          ...result,
          normalizedPayload: result?.normalizedPayload || {},
        };
      },
      async normalizeInput(context = {}, request = {}) {
        const result = await runtimeAdapter.normalizeInput(context, request);
        return {
          ...result,
          normalizedPayload: result?.normalizedPayload || {},
        };
      },
    };
  }

  if (typeof runtimeAdapter === "function") {
    return {
      moduleKey,
      adapterName:
        catalogEntry.adapterName || `${moduleKey}RuntimeAdapter`,
      supportsCollection: true,
      isImplemented: true,
      async collect(...args) {
        return runtimeAdapter(...args);
      },
      async normalizeInput(context = {}, request = {}) {
        const result = await runtimeAdapter(context, request);
        return {
          ...result,
          normalizedPayload: result?.normalizedPayload || {},
        };
      },
    };
  }

  return null;
}

function getModuleAdapter(moduleKey, context = {}) {
  const integrationSource = resolveIntegrationSource(context);
  const catalogEntry = integrationCatalog[moduleKey];
  const runtimeAdapter = normalizeRuntimeAdapter(
    moduleKey,
    integrationSource[moduleKey],
    catalogEntry,
  );

  if (runtimeAdapter) {
    return runtimeAdapter;
  }

  if (!catalogEntry) {
    return null;
  }

  return createProviderAdapter({
    moduleKey,
    ...catalogEntry,
  });
}

function getIntegrationRegistry(context = {}) {
  return Object.keys(integrationCatalog).reduce((registry, moduleKey) => {
    registry[moduleKey] = getModuleAdapter(moduleKey, context);
    return registry;
  }, {});
}

module.exports = {
  getIntegrationRegistry,
  getModuleAdapter,
};
