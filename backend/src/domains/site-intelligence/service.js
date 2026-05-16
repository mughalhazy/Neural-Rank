const { siteIntelligenceContract } = require("./contract");
const {
  createReviewAnalysisCompatibilityAdapter,
} = require("./adapters/reviewAnalysisAdapter");
const {
  createContentListingInsightsCompatibilityAdapter,
} = require("./adapters/contentListingInsightsAdapter");

function createSiteIntelligenceService() {
  return {
    contract: siteIntelligenceContract,
    compatibilityAdapters: {
      review_analysis: createReviewAnalysisCompatibilityAdapter(),
      content_listing_insights:
        createContentListingInsightsCompatibilityAdapter(),
    },
  };
}

module.exports = {
  createSiteIntelligenceService,
};
