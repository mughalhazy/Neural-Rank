const {
  createPostgresModuleRunRepository,
  resolveQueryFunction,
} = require("../../core/persistence");

function resolveBacklinkIntelligenceRepository(context = {}) {
  return (
    context.backlinkIntelligenceRepository ||
    context.repositories?.backlinkIntelligence ||
    null
  );
}

function createPostgresBacklinkIntelligenceRepository(query) {
  return createPostgresModuleRunRepository({
    recordsTable: "backlink_intelligence_records",
    query,
  });
}

async function persistBacklinkIntelligenceRun(context = {}, payload) {
  const explicitRepository = resolveBacklinkIntelligenceRepository(context);
  const repository =
    explicitRepository ||
    (() => {
      const query = resolveQueryFunction(context);
      return query ? createPostgresBacklinkIntelligenceRepository(query) : null;
    })();

  if (!repository || typeof repository.saveRun !== "function") {
    return { persisted: false, reason: "backlink_intelligence_repository_not_configured" };
  }

  const savedRecord = await repository.saveRun(payload);
  return { persisted: true, savedRecord };
}

module.exports = {
  createPostgresBacklinkIntelligenceRepository,
  persistBacklinkIntelligenceRun,
  resolveBacklinkIntelligenceRepository,
};
