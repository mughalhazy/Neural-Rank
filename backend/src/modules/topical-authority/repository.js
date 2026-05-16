const { createPostgresModuleRunRepository, resolveQueryFunction } = require("../../core/persistence");

function resolveTopicalAuthorityRepository(context = {}) {
  return context.topicalAuthorityRepository || context.repositories?.topicalAuthority || null;
}

function createPostgresTopicalAuthorityRepository(query) {
  return createPostgresModuleRunRepository({ recordsTable: "topical_authority_records", query });
}

async function persistTopicalAuthorityRun(context = {}, payload) {
  const explicitRepository = resolveTopicalAuthorityRepository(context);
  const repository = explicitRepository || (() => {
    const query = resolveQueryFunction(context);
    return query ? createPostgresTopicalAuthorityRepository(query) : null;
  })();

  if (!repository || typeof repository.saveRun !== "function") {
    return { persisted: false, reason: "topical_authority_repository_not_configured" };
  }

  const savedRecord = await repository.saveRun(payload);
  return { persisted: true, savedRecord };
}

module.exports = {
  createPostgresTopicalAuthorityRepository,
  persistTopicalAuthorityRun,
  resolveTopicalAuthorityRepository,
};
