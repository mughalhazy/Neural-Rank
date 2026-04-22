const { runDefaultMvpFlow } = require("./defaultMvpOrchestrator");
const { runActivationAwareFlow } = require("./activationAwareOrchestrator");
const { SERVICE_REGISTRY, getModuleService } = require("./serviceRegistry");

module.exports = {
  SERVICE_REGISTRY,
  getModuleService,
  runActivationAwareFlow,
  runDefaultMvpFlow,
};
