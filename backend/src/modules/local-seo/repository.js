const { createPostgresModuleRunRepository, resolveQueryFunction } = require("../../core/persistence");

function resolveLocalSeoRepository(context = {}) {
  return context.localSeoRepository || context.repositories?.localSeo || null;
}

function createPostgresLocalSeoRepository(query) {
  return createPostgresModuleRunRepository({ recordsTable: "local_seo_records", query });
}

async function persistLocalSeoRun(context = {}, payload) {
  const explicitRepository = resolveLocalSeoRepository(context);
  const repository = explicitRepository || (() => {
    const query = resolveQueryFunction(context);
    return query ? createPostgresLocalSeoRepository(query) : null;
  })();

  if (!repository || typeof repository.saveRun !== "function") {
    return { persisted: false, reason: "local_seo_repository_not_configured" };
  }

  const savedRecord = await repository.saveRun(payload);
  return { persisted: true, savedRecord };
}

module.exports = {
  createPostgresLocalSeoRepository,
  persistLocalSeoRun,
  resolveLocalSeoRepository,
};
