const {
  createPostgresModuleRunRepository,
  resolveQueryFunction,
} = require("../../core/persistence");

function resolveSerpFeatureRepository(context = {}) {
  return (
    context.serpFeatureRepository ||
    context.repositories?.serpFeature ||
    null
  );
}

function createPostgresSerpFeatureRepository(query) {
  return createPostgresModuleRunRepository({
    recordsTable: "serp_feature_records",
    query,
  });
}

async function persistSerpFeatureRun(context = {}, payload) {
  const explicitRepository = resolveSerpFeatureRepository(context);
  const repository =
    explicitRepository ||
    (() => {
      const query = resolveQueryFunction(context);
      return query ? createPostgresSerpFeatureRepository(query) : null;
    })();

  if (!repository || typeof repository.saveRun !== "function") {
    return { persisted: false, reason: "serp_feature_repository_not_configured" };
  }

  const savedRecord = await repository.saveRun(payload);
  return { persisted: true, savedRecord };
}

module.exports = {
  createPostgresSerpFeatureRepository,
  persistSerpFeatureRun,
  resolveSerpFeatureRepository,
};
