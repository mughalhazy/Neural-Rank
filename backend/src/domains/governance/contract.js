const { createDomainServiceContract } = require("../../core/domainContracts");

const governanceContract = createDomainServiceContract({
  domainKey: "governance",
  displayName: "Governance",
  serviceKey: "governanceService",
  compatibilityModules: [],
  responsibilities: [
    "own white-hat guardrail policy evaluation before execution lifecycle progression",
    "classify governance risk as allow, warn, require_approval, or block",
    "provide human-readable blocked and warning reasons anchored to Search Essentials, spam policies, and people-first guidance",
  ],
});

module.exports = {
  governanceContract,
};
