const {
  createPostgresModuleRunRepository,
  resolveQueryFunction,
} = require("../../core/persistence");

function resolveSearchIntentRepository(context = {}) {
  return (
    context.searchIntentRepository ||
    context.repositories?.searchIntent ||
    null
  );
}

function createPostgresSearchIntentRepository(query) {
  return createPostgresModuleRunRepository({
    recordsTable: "search_intent_records",
    query,
  });
}

async function persistSearchIntentRun(context = {}, payload) {
  const explicitRepository = resolveSearchIntentRepository(context);
  const repository =
    explicitRepository ||
    (() => {
      const query = resolveQueryFunction(context);
      return query ? createPostgresSearchIntentRepository(query) : null;
    })();

  if (!repository || typeof repository.saveRun !== "function") {
    return { persisted: false, reason: "search_intent_repository_not_configured" };
  }

  const savedRecord = await repository.saveRun(payload);
  return { persisted: true, savedRecord };
}

module.exports = {
  createPostgresSearchIntentRepository,
  persistSearchIntentRun,
  resolveSearchIntentRepository,
};
