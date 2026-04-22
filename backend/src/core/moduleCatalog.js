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
