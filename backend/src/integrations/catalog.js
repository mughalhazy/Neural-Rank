const integrationCatalog = {
  // ── Original boundaries ───────────────────────────────────────────────────
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
    adapterName: "googleSearchConsoleAdapter",
    supportsCollection: true,
    isImplemented: true,
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

  // ── Phase 6 — new module boundaries ──────────────────────────────────────

  technical_seo_audit: {
    moduleKey: "technical_seo_audit",
    adapterName: "pageSpeedInsightsAdapter",
    supportsCollection: true,
    isImplemented: true,
  },
  on_page_seo_scorer: {
    moduleKey: "on_page_seo_scorer",
    adapterName: "onPageSeoScorerAdapterBoundary",
    supportsCollection: true,
    isImplemented: false,
  },
  backlink_intelligence: {
    moduleKey: "backlink_intelligence",
    adapterName: "backlinkProviderAdapter",
    supportsCollection: true,
    isImplemented: true,
  },
  eeat_signals: {
    moduleKey: "eeat_signals",
    adapterName: "eeatSignalsAdapterBoundary",
    supportsCollection: true,
    isImplemented: false,
  },
  search_intent_classifier: {
    moduleKey: "search_intent_classifier",
    adapterName: "searchIntentClassifierAdapterBoundary",
    supportsCollection: true,
    isImplemented: false,
  },
  serp_feature_analyzer: {
    moduleKey: "serp_feature_analyzer",
    adapterName: "serpProviderAdapter",
    supportsCollection: true,
    isImplemented: true,
  },
  topical_authority: {
    moduleKey: "topical_authority",
    adapterName: "topicalAuthorityAdapterBoundary",
    supportsCollection: true,
    isImplemented: false,
  },
  site_architecture: {
    moduleKey: "site_architecture",
    adapterName: "siteArchitectureAdapterBoundary",
    supportsCollection: true,
    isImplemented: false,
  },
  analytics_integration: {
    moduleKey: "analytics_integration",
    adapterName: "googleAnalytics4Adapter",
    supportsCollection: true,
    isImplemented: true,
  },
  local_seo: {
    moduleKey: "local_seo",
    adapterName: "localSeoAdapterBoundary",
    supportsCollection: true,
    isImplemented: false,
  },
};

module.exports = {
  integrationCatalog,
};
