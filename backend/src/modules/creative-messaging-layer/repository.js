const {
  createPostgresModuleRunRepository,
  resolveQueryFunction,
} = require("../../core/persistence");

function resolveExplicitRepository(context = {}) {
  return (
    context.creativeMessagingLayerRepository ||
    context?.repositories?.creativeMessagingLayer ||
    null
  );
}

function createQueryBackedRepository(query) {
  return createPostgresModuleRunRepository({
    recordsTable: "creative_messaging_layer_records",
    query,
  });
}

function resolveCreativeMessagingLayerRepository(context = {}) {
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
  resolveCreativeMessagingLayerRepository,
};
