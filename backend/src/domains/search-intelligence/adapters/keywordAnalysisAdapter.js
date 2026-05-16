const keywordAnalysisService = require("../../../modules/keyword-analysis/service");

function createKeywordAnalysisCompatibilityAdapter() {
  return {
    moduleKey: "keyword_analysis",
    domainKey: "search_intelligence",
    run: keywordAnalysisService.run,
  };
}

module.exports = {
  createKeywordAnalysisCompatibilityAdapter,
};
