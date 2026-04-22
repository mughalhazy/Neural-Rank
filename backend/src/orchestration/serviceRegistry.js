const reviewAnalysisService = require("../modules/review-analysis/service");
const contentListingInsightsService = require("../modules/content-listing-insights/service");
const keywordAnalysisService = require("../modules/keyword-analysis/service");
const rankTrackingService = require("../modules/rank-tracking/service");
const competitorAnalysisService = require("../modules/competitor-analysis/service");
const optimizationLayerService = require("../modules/optimization-layer/service");
const creativeMessagingLayerService = require("../modules/creative-messaging-layer/service");
const unifiedWorkflowLayerService = require("../modules/unified-workflow-layer/service");

function normalizeServiceExport(serviceExport) {
  if (serviceExport && typeof serviceExport.run === "function") {
    return serviceExport;
  }

  if (!serviceExport || typeof serviceExport !== "object") {
    return null;
  }

  const nestedService = Object.values(serviceExport).find(
    (entry) => entry && typeof entry.run === "function",
  );

  return nestedService || null;
}

const serviceRegistry = {
  review_analysis: normalizeServiceExport(reviewAnalysisService),
  content_listing_insights: normalizeServiceExport(contentListingInsightsService),
  keyword_analysis: normalizeServiceExport(keywordAnalysisService),
  rank_tracking: normalizeServiceExport(rankTrackingService),
  competitor_analysis: normalizeServiceExport(competitorAnalysisService),
  optimization_layer: normalizeServiceExport(optimizationLayerService),
  creative_messaging_layer: normalizeServiceExport(creativeMessagingLayerService),
  unified_workflow_layer: normalizeServiceExport(unifiedWorkflowLayerService),
};

const executionOrder = [
  "review_analysis",
  "content_listing_insights",
  "keyword_analysis",
  "rank_tracking",
  "competitor_analysis",
  "optimization_layer",
  "creative_messaging_layer",
  "unified_workflow_layer",
];

function getServiceRegistry() {
  return { ...serviceRegistry };
}

function getRegisteredModuleKeys() {
  return executionOrder.filter((moduleKey) => serviceRegistry[moduleKey]);
}

function getModuleService(moduleKey) {
  return serviceRegistry[moduleKey] || null;
}

module.exports = {
  executionOrder,
  getModuleService,
  getRegisteredModuleKeys,
  getServiceRegistry,
  serviceRegistry,
};
