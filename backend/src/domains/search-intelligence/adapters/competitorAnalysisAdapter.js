const competitorAnalysisService = require("../../../modules/competitor-analysis/service");

function createCompetitorAnalysisCompatibilityAdapter() {
  return {
    moduleKey: "competitor_analysis",
    domainKey: "search_intelligence",
    run: competitorAnalysisService.run,
  };
}

module.exports = {
  createCompetitorAnalysisCompatibilityAdapter,
};
