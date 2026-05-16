const {
  createPostgresModuleRunRepository,
  resolveQueryFunction,
} = require("../../core/persistence");

function resolveRankTrackingRepository(context = {}) {
  return (
    context.rankTrackingRepository ||
    context.repositories?.rankTracking ||
    null
  );
}

function createPostgresRankTrackingRepository(query) {
  return createPostgresModuleRunRepository({
    recordsTable: "rank_tracking_records",
    query,
  });
}

async function persistRankTrackingRun(context = {}, payload) {
  const explicitRepository = resolveRankTrackingRepository(context);
  const repository =
    explicitRepository ||
    (() => {
      const query = resolveQueryFunction(context);
      return query ? createPostgresRankTrackingRepository(query) : null;
    })();

  if (!repository || typeof repository.saveRun !== "function") {
    return {
      persisted: false,
      reason: "rank_tracking_repository_not_configured",
    };
  }

  const savedRecord = await repository.saveRun(payload);

  return {
    persisted: true,
    savedRecord,
  };
}

module.exports = {
  createPostgresRankTrackingRepository,
  persistRankTrackingRun,
  resolveRankTrackingRepository,
};
