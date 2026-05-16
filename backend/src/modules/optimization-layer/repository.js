const {
  createPostgresModuleRunRepository,
  resolveQueryFunction,
} = require("../../core/persistence");

function resolveExplicitRepository(context = {}) {
  return (
    context.optimizationLayerRepository ||
    context?.repositories?.optimizationLayer ||
    null
  );
}

function createQueryBackedRepository(query) {
  return createPostgresModuleRunRepository({
    recordsTable: "optimization_layer_records",
    query,
  });
}

function resolveOptimizationLayerRepository(context = {}) {
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
  resolveOptimizationLayerRepository,
};
