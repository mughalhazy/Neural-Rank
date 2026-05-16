const { createDomainServiceContract } = require("../../core/domainContracts");

const contentOperationsContract = createDomainServiceContract({
  domainKey: "content_operations",
  displayName: "Content Operations",
  serviceKey: "contentOperationsService",
  compatibilityModules: [
    "optimization_layer",
    "creative_messaging_layer",
  ],
  responsibilities: [
    "coordinate rewrite, messaging, and optimization operations",
    "provide bounded contracts for future brief, refresh, and linking services",
    "preserve compatibility with legacy optimization and messaging modules",
  ],
});

module.exports = {
  contentOperationsContract,
};
