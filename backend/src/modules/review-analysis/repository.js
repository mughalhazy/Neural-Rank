const {
  createPostgresModuleRunRepository,
  resolveQueryFunction,
} = require("../../core/persistence");

function resolveReviewAnalysisRepository(context = {}) {
  return (
    context.reviewAnalysisRepository ||
    context.repositories?.reviewAnalysis ||
    null
  );
}

function createPostgresReviewAnalysisRepository(query) {
  return createPostgresModuleRunRepository({
    recordsTable: "review_analysis_records",
    query,
  });
}

async function persistReviewAnalysisRun(context = {}, payload) {
  const explicitRepository = resolveReviewAnalysisRepository(context);
  const repository =
    explicitRepository ||
    (() => {
      const query = resolveQueryFunction(context);
      return query ? createPostgresReviewAnalysisRepository(query) : null;
    })();

  if (!repository || typeof repository.saveRun !== "function") {
    return {
      persisted: false,
      reason: "review_analysis_repository_not_configured",
    };
  }

  const savedRecord = await repository.saveRun(payload);

  return {
    persisted: true,
    savedRecord,
  };
}

module.exports = {
  createPostgresReviewAnalysisRepository,
  persistReviewAnalysisRun,
  resolveReviewAnalysisRepository,
};
