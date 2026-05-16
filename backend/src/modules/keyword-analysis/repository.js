const {
  createPostgresModuleRunRepository,
  resolveQueryFunction,
} = require("../../core/persistence");

function resolveKeywordAnalysisRepository(context = {}) {
  return (
    context.keywordAnalysisRepository ||
    context.repositories?.keywordAnalysis ||
    null
  );
}

function createPostgresKeywordAnalysisRepository(query) {
  return createPostgresModuleRunRepository({
    recordsTable: "keyword_analysis_records",
    query,
  });
}

async function persistKeywordAnalysisRun(context = {}, payload) {
  const explicitRepository = resolveKeywordAnalysisRepository(context);
  const repository =
    explicitRepository ||
    (() => {
      const query = resolveQueryFunction(context);
      return query ? createPostgresKeywordAnalysisRepository(query) : null;
    })();

  if (!repository || typeof repository.saveRun !== "function") {
    return {
      persisted: false,
      reason: "keyword_analysis_repository_not_configured",
    };
  }

  const savedRecord = await repository.saveRun(payload);

  return {
    persisted: true,
    savedRecord,
  };
}

module.exports = {
  createPostgresKeywordAnalysisRepository,
  persistKeywordAnalysisRun,
  resolveKeywordAnalysisRepository,
};
