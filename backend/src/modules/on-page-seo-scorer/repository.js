const {
  createPostgresModuleRunRepository,
  resolveQueryFunction,
} = require("../../core/persistence");

function resolveOnPageSeoRepository(context = {}) {
  return (
    context.onPageSeoRepository ||
    context.repositories?.onPageSeo ||
    null
  );
}

function createPostgresOnPageSeoRepository(query) {
  return createPostgresModuleRunRepository({
    recordsTable: "on_page_seo_records",
    query,
  });
}

async function persistOnPageSeoRun(context = {}, payload) {
  const explicitRepository = resolveOnPageSeoRepository(context);
  const repository =
    explicitRepository ||
    (() => {
      const query = resolveQueryFunction(context);
      return query ? createPostgresOnPageSeoRepository(query) : null;
    })();

  if (!repository || typeof repository.saveRun !== "function") {
    return {
      persisted: false,
      reason: "on_page_seo_repository_not_configured",
    };
  }

  const savedRecord = await repository.saveRun(payload);
  return { persisted: true, savedRecord };
}

module.exports = {
  createPostgresOnPageSeoRepository,
  persistOnPageSeoRun,
  resolveOnPageSeoRepository,
};
