const {
  createPostgresModuleRunRepository,
  resolveQueryFunction,
} = require("../../core/persistence");

function resolveExplicitRepository(context = {}) {
  return (
    context.competitorAnalysisRepository ||
    context?.repositories?.competitorAnalysis ||
    null
  );
}

function createQueryBackedRepository(query) {
  return createPostgresModuleRunRepository({
    recordsTable: "competitor_analysis_records",
    query,
  });
}

function resolveCompetitorAnalysisRepository(context = {}) {
  const explicitRepository = resolveExplicitRepository(context);
  if (explicitRepository) {
    return explicitRepository;
  }

  const query = resolveQueryFunction(context);
  if (!query) {
    return null;
  }

  return createQueryBackedRepository(query);
}

module.exports = {
  createQueryBackedRepository,
  resolveCompetitorAnalysisRepository,
};
