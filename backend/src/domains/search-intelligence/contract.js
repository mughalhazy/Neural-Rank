const { createDomainServiceContract } = require("../../core/domainContracts");

const searchIntelligenceContract = createDomainServiceContract({
  domainKey: "search_intelligence",
  displayName: "Search Intelligence",
  serviceKey: "searchIntelligenceService",
  compatibilityModules: [
    "keyword_analysis",
    "rank_tracking",
    "competitor_analysis",
  ],
  responsibilities: [
    "coordinate keyword, ranking, and competitor intelligence",
    "provide provider-based SERP and intent service contracts without direct scraping",
    "classify query intent and opportunity with explicit confidence and unavailable-provider states",
    "preserve compatibility with legacy search-facing modules",
  ],
});

module.exports = {
  searchIntelligenceContract,
};
