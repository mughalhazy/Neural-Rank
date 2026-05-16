const {
  createPostgresModuleRunRepository,
  resolveQueryFunction,
} = require("../../core/persistence");

function resolveEeatSignalsRepository(context = {}) {
  return (
    context.eeatSignalsRepository ||
    context.repositories?.eeatSignals ||
    null
  );
}

function createPostgresEeatSignalsRepository(query) {
  return createPostgresModuleRunRepository({
    recordsTable: "eeat_signal_records",
    query,
  });
}

async function persistEeatSignalsRun(context = {}, payload) {
  const explicitRepository = resolveEeatSignalsRepository(context);
  const repository =
    explicitRepository ||
    (() => {
      const query = resolveQueryFunction(context);
      return query ? createPostgresEeatSignalsRepository(query) : null;
    })();

  if (!repository || typeof repository.saveRun !== "function") {
    return { persisted: false, reason: "eeat_signals_repository_not_configured" };
  }

  const savedRecord = await repository.saveRun(payload);
  return { persisted: true, savedRecord };
}

module.exports = {
  createPostgresEeatSignalsRepository,
  persistEeatSignalsRun,
  resolveEeatSignalsRepository,
};
