// Per-module required input field sets.
// At least one field from the set must be present in moduleInput for the run to proceed.
// "none" means the module accepts empty input and produces generic results.
const MODULE_INPUT_REQUIREMENTS = {
  review_analysis: ["appId", "websiteUrl"],
  content_listing_insights: ["websiteUrl", "appId", "url"],
  keyword_analysis: ["keywords", "websiteUrl", "targetUrl"],
  rank_tracking: ["keywords", "websiteUrl", "domain"],
  competitor_analysis: ["websiteUrl", "domain", "competitors"],
  optimization_layer: ["websiteUrl", "url"],
  creative_messaging_layer: ["websiteUrl", "appId", "product"],
  unified_workflow_layer: ["websiteUrl", "appId"],
  technical_seo_audit: ["websiteUrl", "url", "domain"],
  on_page_seo_scorer: ["websiteUrl", "url"],
  backlink_intelligence: ["websiteUrl", "domain"],
  eeat_signals: ["websiteUrl", "domain", "author"],
  search_intent_classifier: ["keywords", "query"],
  serp_feature_analyzer: ["keywords", "query", "websiteUrl"],
  topical_authority: ["websiteUrl", "domain", "topic"],
  site_architecture: ["websiteUrl", "domain"],
  analytics_integration: ["websiteUrl", "domain"],
  local_seo: ["websiteUrl", "domain", "location"],
};

module.exports = { MODULE_INPUT_REQUIREMENTS };
