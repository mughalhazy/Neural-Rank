const {
  createPostgresModuleRunRepository,
  resolveQueryFunction,
} = require("../../core/persistence");

function resolveExplicitRepository(context = {}) {
  return (
    context.unifiedWorkflowLayerRepository ||
    context?.repositories?.unifiedWorkflowLayer ||
    null
  );
}

function createQueryBackedRepository(query) {
  return createPostgresModuleRunRepository({
    recordsTable: "unified_workflow_layer_records",
    query,
  });
}

function resolveUnifiedWorkflowLayerRepository(context = {}) {
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
  resolveUnifiedWorkflowLayerRepository,
};
