const MODULE_CATALOG = Object.freeze([
  {
    moduleKey: "review_analysis",
    displayName: "Review Analysis",
    defaultActive: true,
    initialState: "mvp_active",
  },
  {
    moduleKey: "content_listing_insights",
    displayName: "Content / Listing Insights",
    defaultActive: true,
    initialState: "mvp_active",
  },
  {
    moduleKey: "keyword_analysis",
    displayName: "Keyword Analysis",
    defaultActive: true,
    initialState: "mvp_active",
  },
  {
    moduleKey: "rank_tracking",
    displayName: "Rank Tracking",
    defaultActive: true,
    initialState: "mvp_active",
  },
  {
    moduleKey: "competitor_analysis",
    displayName: "Competitor Analysis",
    defaultActive: true,
    initialState: "backend_active",
  },
  {
    moduleKey: "optimization_layer",
    displayName: "Optimization Layer",
    defaultActive: true,
    initialState: "backend_active",
  },
  {
    moduleKey: "creative_messaging_layer",
    displayName: "Creative / Messaging Layer",
    defaultActive: true,
    initialState: "backend_active",
  },
  {
    moduleKey: "unified_workflow_layer",
    displayName: "Unified Workflow Layer",
    defaultActive: true,
    initialState: "backend_active",
    isWorkflowModule: true,
  },
  {
    moduleKey: "technical_seo_audit",
    displayName: "Technical SEO Audit",
    defaultActive: true,
    initialState: "backend_active",
  },
  {
    moduleKey: "on_page_seo_scorer",
    displayName: "On-Page SEO Scorer",
    defaultActive: true,
    initialState: "backend_active",
  },
  {
    moduleKey: "backlink_intelligence",
    displayName: "Backlink Intelligence",
    defaultActive: true,
    initialState: "backend_active",
  },
  {
    moduleKey: "eeat_signals",
    displayName: "E-E-A-T Signals",
    defaultActive: true,
    initialState: "backend_active",
  },
  {
    moduleKey: "search_intent_classifier",
    displayName: "Search Intent Classifier",
    defaultActive: true,
    initialState: "backend_active",
  },
  {
    moduleKey: "serp_feature_analyzer",
    displayName: "SERP Feature Analyzer",
    defaultActive: true,
    initialState: "backend_active",
  },
  {
    moduleKey: "topical_authority",
    displayName: "Topical Authority",
    defaultActive: true,
    initialState: "backend_active",
  },
  {
    moduleKey: "site_architecture",
    displayName: "Site Architecture",
    defaultActive: true,
    initialState: "backend_active",
  },
  {
    moduleKey: "analytics_integration",
    displayName: "Analytics Integration",
    defaultActive: true,
    initialState: "backend_active",
  },
  {
    moduleKey: "local_seo",
    displayName: "Local SEO",
    defaultActive: false,
    initialState: "backend_active",
  },
]);

function getModuleDefinition(moduleKey) {
  return MODULE_CATALOG.find((item) => item.moduleKey === moduleKey) || null;
}

function getDefaultActiveModules() {
  return MODULE_CATALOG.filter((item) => item.defaultActive);
}

module.exports = {
  moduleCatalog: MODULE_CATALOG,
  MODULE_CATALOG,
  getModuleDefinition,
  getDefaultActiveModules,
};
