const rankTrackingService = require("../../../modules/rank-tracking/service");

function createRankTrackingCompatibilityAdapter() {
  return {
    moduleKey: "rank_tracking",
    domainKey: "search_intelligence",
    run: rankTrackingService.run,
  };
}

module.exports = {
  createRankTrackingCompatibilityAdapter,
};
