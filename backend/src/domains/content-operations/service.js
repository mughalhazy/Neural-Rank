const { contentOperationsContract } = require("./contract");
const {
  createOptimizationLayerCompatibilityAdapter,
} = require("./adapters/optimizationLayerAdapter");
const {
  createCreativeMessagingCompatibilityAdapter,
} = require("./adapters/creativeMessagingAdapter");

function createContentOperationsService() {
  return {
    contract: contentOperationsContract,
    compatibilityAdapters: {
      optimization_layer: createOptimizationLayerCompatibilityAdapter(),
      creative_messaging_layer: createCreativeMessagingCompatibilityAdapter(),
    },
  };
}

module.exports = {
  createContentOperationsService,
};
