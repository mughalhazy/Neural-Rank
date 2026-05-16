const reviewAnalysisService = require("../../../modules/review-analysis/service");

function createReviewAnalysisCompatibilityAdapter() {
  return {
    moduleKey: "review_analysis",
    domainKey: "site_intelligence",
    run: reviewAnalysisService.run,
  };
}

module.exports = {
  createReviewAnalysisCompatibilityAdapter,
};
