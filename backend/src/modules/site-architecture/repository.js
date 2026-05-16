const { createPostgresModuleRunRepository, resolveQueryFunction } = require("../../core/persistence");

function resolveSiteArchitectureRepository(context = {}) {
  return context.siteArchitectureRepository || context.repositories?.siteArchitecture || null;
}

function createPostgresSiteArchitectureRepository(query) {
  return createPostgresModuleRunRepository({ recordsTable: "site_architecture_records", query });
}

async function persistSiteArchitectureRun(context = {}, payload) {
  const explicitRepository = resolveSiteArchitectureRepository(context);
  const repository = explicitRepository || (() => {
    const query = resolveQueryFunction(context);
    return query ? createPostgresSiteArchitectureRepository(query) : null;
  })();

  if (!repository || typeof repository.saveRun !== "function") {
    return { persisted: false, reason: "site_architecture_repository_not_configured" };
  }

  const savedRecord = await repository.saveRun(payload);
  return { persisted: true, savedRecord };
}

module.exports = {
  createPostgresSiteArchitectureRepository,
  persistSiteArchitectureRun,
  resolveSiteArchitectureRepository,
};
