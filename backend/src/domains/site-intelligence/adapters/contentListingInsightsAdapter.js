const contentListingInsightsService = require("../../../modules/content-listing-insights/service");

function createContentListingInsightsCompatibilityAdapter() {
  return {
    moduleKey: "content_listing_insights",
    domainKey: "site_intelligence",
    run: contentListingInsightsService.run,
  };
}

module.exports = {
  createContentListingInsightsCompatibilityAdapter,
};
