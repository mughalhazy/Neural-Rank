const { createDomainServiceContract } = require("../../core/domainContracts");

const siteIntelligenceContract = createDomainServiceContract({
  domainKey: "site_intelligence",
  displayName: "Site Intelligence",
  serviceKey: "siteIntelligenceService",
  compatibilityModules: [
    "review_analysis",
    "content_listing_insights",
  ],
  responsibilities: [
    "normalize target and surface inputs",
    "coordinate page, section, and trust-oriented intelligence over time",
    "preserve compatibility with legacy review and content/listing modules",
  ],
});

module.exports = {
  siteIntelligenceContract,
};
