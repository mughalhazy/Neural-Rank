const reviewAnalysisService = require("../modules/review-analysis/service");
const contentListingInsightsService = require("../modules/content-listing-insights/service");
const keywordAnalysisService = require("../modules/keyword-analysis/service");
const rankTrackingService = require("../modules/rank-tracking/service");
const competitorAnalysisService = require("../modules/competitor-analysis/service");
const optimizationLayerService = require("../modules/optimization-layer/service");
const creativeMessagingLayerService = require("../modules/creative-messaging-layer/service");
const unifiedWorkflowLayerService = require("../modules/unified-workflow-layer/service");
const technicalSeoAuditService = require("../modules/technical-seo-audit/service");
const onPageSeoScorerService = require("../modules/on-page-seo-scorer/service");
const backlinkIntelligenceService = require("../modules/backlink-intelligence/service");
const eeatSignalsService = require("../modules/eeat-signals/service");
const searchIntentClassifierService = require("../modules/search-intent-classifier/service");
const serpFeatureAnalyzerService = require("../modules/serp-feature-analyzer/service");
const topicalAuthorityService = require("../modules/topical-authority/service");
const siteArchitectureService = require("../modules/site-architecture/service");
const analyticsIntegrationService = require("../modules/analytics-integration/service");
const localSeoService = require("../modules/local-seo/service");

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
  technical_seo_audit: normalizeServiceExport(technicalSeoAuditService),
  on_page_seo_scorer: normalizeServiceExport(onPageSeoScorerService),
  backlink_intelligence: normalizeServiceExport(backlinkIntelligenceService),
  eeat_signals: normalizeServiceExport(eeatSignalsService),
  search_intent_classifier: normalizeServiceExport(searchIntentClassifierService),
  serp_feature_analyzer: normalizeServiceExport(serpFeatureAnalyzerService),
  topical_authority: normalizeServiceExport(topicalAuthorityService),
  site_architecture: normalizeServiceExport(siteArchitectureService),
  analytics_integration: normalizeServiceExport(analyticsIntegrationService),
  local_seo: normalizeServiceExport(localSeoService),
  unified_workflow_layer: normalizeServiceExport(unifiedWorkflowLayerService),
};

const executionOrder = [
  "technical_seo_audit",
  "review_analysis",
  "content_listing_insights",
  "keyword_analysis",
  "rank_tracking",
  "competitor_analysis",
  "optimization_layer",
  "creative_messaging_layer",
  "on_page_seo_scorer",
  "backlink_intelligence",
  "eeat_signals",
  "search_intent_classifier",
  "serp_feature_analyzer",
  "topical_authority",
  "site_architecture",
  "analytics_integration",
  "local_seo",
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
