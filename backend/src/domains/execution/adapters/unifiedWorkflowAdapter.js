const unifiedWorkflowLayerService = require("../../../modules/unified-workflow-layer/service");

function createUnifiedWorkflowCompatibilityAdapter() {
  return {
    moduleKey: "unified_workflow_layer",
    domainKey: "execution",
    run: unifiedWorkflowLayerService.run,
  };
}

module.exports = {
  createUnifiedWorkflowCompatibilityAdapter,
};
