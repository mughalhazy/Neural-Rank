const { createDomainServiceContract } = require("../../core/domainContracts");

const technicalOperationsContract = createDomainServiceContract({
  domainKey: "technical_operations",
  displayName: "Technical Operations",
  serviceKey: "technicalOperationsService",
  compatibilityModules: [],
  responsibilities: [
    "own source HTML technical SEO analysis contracts",
    "keep source HTML analysis separate from rendered DOM analysis",
    "return structured findings with severity, evidence, recommended action, governance risk, and confidence",
  ],
});

module.exports = {
  technicalOperationsContract,
};
