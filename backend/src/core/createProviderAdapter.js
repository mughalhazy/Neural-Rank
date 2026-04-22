function createIntegrationNotConnectedResult(moduleKey, reason, metadata = {}) {
  return {
    status: "integration_not_connected",
    moduleKey,
    reason,
    metadata,
  };
}

function createIntegrationIncompleteResult(moduleKey, reason, metadata = {}) {
  return {
    status: "integration_incomplete",
    moduleKey,
    reason,
    metadata,
  };
}

function normalizeProviderConfig(config = {}) {
  return {
    moduleKey: config.moduleKey,
    adapterName: config.adapterName || config.moduleKey || "unknown_adapter",
    supportsCollection: config.supportsCollection === true,
    isImplemented: config.isImplemented === true,
    metadata: config.metadata || {},
  };
}

function createProviderAdapter(config = {}) {
  const normalizedConfig = normalizeProviderConfig(config);

  async function collect() {
    if (!normalizedConfig.supportsCollection) {
      return createIntegrationNotConnectedResult(
        normalizedConfig.moduleKey,
        "No collection path is defined for this integration boundary.",
        {
          adapterName: normalizedConfig.adapterName,
        },
      );
    }

    if (!normalizedConfig.isImplemented) {
      return createIntegrationIncompleteResult(
        normalizedConfig.moduleKey,
        "This integration boundary is defined but not implemented.",
        {
          adapterName: normalizedConfig.adapterName,
        },
      );
    }

    return createIntegrationIncompleteResult(
      normalizedConfig.moduleKey,
      "This adapter is marked implemented but has no concrete runtime collector bound.",
      {
        adapterName: normalizedConfig.adapterName,
      },
    );
  }

  return {
    moduleKey: normalizedConfig.moduleKey,
    adapterName: normalizedConfig.adapterName,
    supportsCollection: normalizedConfig.supportsCollection,
    isImplemented: normalizedConfig.isImplemented,
    metadata: normalizedConfig.metadata,
    collect,
    async normalizeInput(_context = {}, _request = {}) {
      const result = await collect();
      return {
        ...result,
        normalizedPayload: {},
      };
    },
  };
}

module.exports = {
  createIntegrationIncompleteResult,
  createIntegrationNotConnectedResult,
  createProviderAdapter,
};
