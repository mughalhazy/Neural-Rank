const { createDomainServiceContract } = require("../../core/domainContracts");

const businessIntelligenceContract = createDomainServiceContract({
  domainKey: "business_intelligence",
  displayName: "Business Intelligence",
  serviceKey: "businessIntelligenceService",
  compatibilityModules: [],
  responsibilities: [
    "own manual-input business objective, target page value, funnel stage, lead and revenue relevance, and business scoring contracts",
    "preserve unknown business values as null instead of inventing revenue or ROI data",
    "influence prioritization only when evidence-backed business values exist",
  ],
});

module.exports = {
  businessIntelligenceContract,
};
