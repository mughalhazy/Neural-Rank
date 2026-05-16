const {
  createPostgresModuleRunRepository,
  resolveQueryFunction,
} = require("../../core/persistence");

function resolveContentListingInsightsRepository(context = {}) {
  return (
    context.contentListingInsightsRepository ||
    context.repositories?.contentListingInsights ||
    null
  );
}

function createPostgresContentListingInsightsRepository(query) {
  return createPostgresModuleRunRepository({
    recordsTable: "content_listing_insight_records",
    query,
  });
}

async function persistContentListingInsightsRun(context = {}, payload) {
  const explicitRepository = resolveContentListingInsightsRepository(context);
  const repository =
    explicitRepository ||
    (() => {
      const query = resolveQueryFunction(context);
      return query ? createPostgresContentListingInsightsRepository(query) : null;
    })();

  if (!repository || typeof repository.saveRun !== "function") {
    return {
      persisted: false,
      reason: "content_listing_insights_repository_not_configured",
    };
  }

  const savedRecord = await repository.saveRun(payload);

  return {
    persisted: true,
    savedRecord,
  };
}

module.exports = {
  createPostgresContentListingInsightsRepository,
  persistContentListingInsightsRun,
  resolveContentListingInsightsRepository,
};
