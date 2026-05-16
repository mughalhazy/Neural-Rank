const optimizationLayerService = require("../../../modules/optimization-layer/service");

function createOptimizationLayerCompatibilityAdapter() {
  return {
    moduleKey: "optimization_layer",
    domainKey: "content_operations",
    run: optimizationLayerService.run,
  };
}

module.exports = {
  createOptimizationLayerCompatibilityAdapter,
};
