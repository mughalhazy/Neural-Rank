const { createPostgresModuleRunRepository, resolveQueryFunction } = require("../../core/persistence");

function resolveAnalyticsIntegrationRepository(context = {}) {
  return context.analyticsIntegrationRepository || context.repositories?.analyticsIntegration || null;
}

function createPostgresAnalyticsIntegrationRepository(query) {
  return createPostgresModuleRunRepository({ recordsTable: "analytics_integration_records", query });
}

async function persistAnalyticsIntegrationRun(context = {}, payload) {
  const explicitRepository = resolveAnalyticsIntegrationRepository(context);
  const repository = explicitRepository || (() => {
    const query = resolveQueryFunction(context);
    return query ? createPostgresAnalyticsIntegrationRepository(query) : null;
  })();

  if (!repository || typeof repository.saveRun !== "function") {
    return { persisted: false, reason: "analytics_integration_repository_not_configured" };
  }

  const savedRecord = await repository.saveRun(payload);
  return { persisted: true, savedRecord };
}

module.exports = {
  createPostgresAnalyticsIntegrationRepository,
  persistAnalyticsIntegrationRun,
  resolveAnalyticsIntegrationRepository,
};
