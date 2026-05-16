const { createDomainServiceContract } = require("../../core/domainContracts");

const executionContract = createDomainServiceContract({
  domainKey: "execution",
  displayName: "Execution",
  serviceKey: "executionService",
  compatibilityModules: ["unified_workflow_layer"],
  responsibilities: [
    "own task registry, recommendation registry, approval status, execution status, verification status, rollback metadata, and audit trail contracts",
    "require approval before recommendations become executable tasks",
    "write auditable lifecycle state for task creation and task status transitions",
    "preserve compatibility with the legacy workflow coordination module",
  ],
});

module.exports = {
  executionContract,
};
