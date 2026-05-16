const {
  createPostgresModuleRunRepository,
  resolveQueryFunction,
} = require("../../core/persistence");

function resolveTechnicalSeoAuditRepository(context = {}) {
  return (
    context.technicalSeoAuditRepository ||
    context.repositories?.technicalSeoAudit ||
    null
  );
}

function createPostgresTechnicalSeoAuditRepository(query) {
  return createPostgresModuleRunRepository({
    recordsTable: "technical_seo_audit_records",
    query,
  });
}

async function persistTechnicalSeoAuditRun(context = {}, payload) {
  const explicitRepository = resolveTechnicalSeoAuditRepository(context);
  const repository =
    explicitRepository ||
    (() => {
      const query = resolveQueryFunction(context);
      return query ? createPostgresTechnicalSeoAuditRepository(query) : null;
    })();

  if (!repository || typeof repository.saveRun !== "function") {
    return {
      persisted: false,
      reason: "technical_seo_audit_repository_not_configured",
    };
  }

  const savedRecord = await repository.saveRun(payload);
  return { persisted: true, savedRecord };
}

module.exports = {
  createPostgresTechnicalSeoAuditRepository,
  persistTechnicalSeoAuditRun,
  resolveTechnicalSeoAuditRepository,
};
