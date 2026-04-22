const integrationCatalog = {
  review_analysis: {
    moduleKey: "review_analysis",
    adapterName: "reviewAnalysisAdapterBoundary",
    supportsCollection: true,
    isImplemented: false,
  },
  content_listing_insights: {
    moduleKey: "content_listing_insights",
    adapterName: "contentListingInsightsAdapterBoundary",
    supportsCollection: true,
    isImplemented: false,
  },
  keyword_analysis: {
    moduleKey: "keyword_analysis",
    adapterName: "keywordAnalysisAdapterBoundary",
    supportsCollection: true,
    isImplemented: false,
  },
  rank_tracking: {
    moduleKey: "rank_tracking",
    adapterName: "rankTrackingAdapterBoundary",
    supportsCollection: true,
    isImplemented: false,
  },
  competitor_analysis: {
    moduleKey: "competitor_analysis",
    adapterName: "competitorAnalysisAdapterBoundary",
    supportsCollection: true,
    isImplemented: false,
  },
  optimization_layer: {
    moduleKey: "optimization_layer",
    adapterName: "optimizationLayerAdapterBoundary",
    supportsCollection: true,
    isImplemented: false,
  },
  creative_messaging_layer: {
    moduleKey: "creative_messaging_layer",
    adapterName: "creativeMessagingLayerAdapterBoundary",
    supportsCollection: true,
    isImplemented: false,
  },
  unified_workflow_layer: {
    moduleKey: "unified_workflow_layer",
    adapterName: "unifiedWorkflowLayerAdapterBoundary",
    supportsCollection: false,
    isImplemented: false,
  },
};

module.exports = {
  integrationCatalog,
};
