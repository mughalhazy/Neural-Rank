// T2-05: Real Postgres integration tests for all 18 module persistRun / saveRun functions.
// Requires DATABASE_URL to point to a test Postgres instance.
// Run with: npm run test:integration
// Skipped automatically when DATABASE_URL is not set.

const assert = require("node:assert/strict");

const CANONICAL_REF = "https://integration-test.persistence.example.com";

const RECORD_TABLES = [
  "review_analysis_records",
  "content_listing_insight_records",
  "keyword_analysis_records",
  "rank_tracking_records",
  "competitor_analysis_records",
  "optimization_layer_records",
  "creative_messaging_layer_records",
  "unified_workflow_layer_records",
  "technical_seo_audit_records",
  "on_page_seo_records",
  "backlink_intelligence_records",
  "eeat_signal_records",
  "search_intent_records",
  "serp_feature_records",
  "topical_authority_records",
  "site_architecture_records",
  "analytics_integration_records",
  "local_seo_records",
];

async function run() {
  if (!process.env.DATABASE_URL) {
    console.log("integration/persistence-postgres: skipped — DATABASE_URL not set");
    return;
  }

  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  const query = (sql, params) => pool.query(sql, params);
  const context = { query };

  const PAYLOAD = {
    productTarget: { websiteUrl: CANONICAL_REF },
    inputPayload: { test: true },
    analysisPayload: { tested: true },
    insightPayload: [],
    actionPayload: [],
    integrationState: "internal_only",
    processingStatus: "completed",
  };

  // modules that export a persistXxxRun(context, payload) wrapper
  const {
    persistReviewAnalysisRun,
  } = require("../modules/review-analysis/repository");
  const {
    persistContentListingInsightsRun,
  } = require("../modules/content-listing-insights/repository");
  const {
    persistKeywordAnalysisRun,
  } = require("../modules/keyword-analysis/repository");
  const {
    persistRankTrackingRun,
  } = require("../modules/rank-tracking/repository");
  const {
    persistEeatSignalsRun,
  } = require("../modules/eeat-signals/repository");
  const {
    persistBacklinkIntelligenceRun,
  } = require("../modules/backlink-intelligence/repository");
  const {
    persistTechnicalSeoAuditRun,
  } = require("../modules/technical-seo-audit/repository");
  const {
    persistOnPageSeoRun,
  } = require("../modules/on-page-seo-scorer/repository");
  const {
    persistSearchIntentRun,
  } = require("../modules/search-intent-classifier/repository");
  const {
    persistSerpFeatureRun,
  } = require("../modules/serp-feature-analyzer/repository");
  const {
    persistTopicalAuthorityRun,
  } = require("../modules/topical-authority/repository");
  const {
    persistSiteArchitectureRun,
  } = require("../modules/site-architecture/repository");
  const {
    persistAnalyticsIntegrationRun,
  } = require("../modules/analytics-integration/repository");
  const {
    persistLocalSeoRun,
  } = require("../modules/local-seo/repository");

  // modules that expose resolveXxxRepository (no persistRun wrapper)
  const {
    resolveCompetitorAnalysisRepository,
  } = require("../modules/competitor-analysis/repository");
  const {
    resolveOptimizationLayerRepository,
  } = require("../modules/optimization-layer/repository");
  const {
    resolveCreativeMessagingLayerRepository,
  } = require("../modules/creative-messaging-layer/repository");
  const {
    resolveUnifiedWorkflowLayerRepository,
  } = require("../modules/unified-workflow-layer/repository");

  const persistFns = [
    ["review_analysis", persistReviewAnalysisRun],
    ["content_listing_insights", persistContentListingInsightsRun],
    ["keyword_analysis", persistKeywordAnalysisRun],
    ["rank_tracking", persistRankTrackingRun],
    ["eeat_signals", persistEeatSignalsRun],
    ["backlink_intelligence", persistBacklinkIntelligenceRun],
    ["technical_seo_audit", persistTechnicalSeoAuditRun],
    ["on_page_seo_scorer", persistOnPageSeoRun],
    ["search_intent_classifier", persistSearchIntentRun],
    ["serp_feature_analyzer", persistSerpFeatureRun],
    ["topical_authority", persistTopicalAuthorityRun],
    ["site_architecture", persistSiteArchitectureRun],
    ["analytics_integration", persistAnalyticsIntegrationRun],
    ["local_seo", persistLocalSeoRun],
  ];

  const resolverFns = [
    ["competitor_analysis", resolveCompetitorAnalysisRepository],
    ["optimization_layer", resolveOptimizationLayerRepository],
    ["creative_messaging_layer", resolveCreativeMessagingLayerRepository],
    ["unified_workflow_layer", resolveUnifiedWorkflowLayerRepository],
  ];

  try {
    for (const [moduleKey, persistFn] of persistFns) {
      const result = await persistFn(context, PAYLOAD);
      assert.equal(result.persisted, true, `${moduleKey}: persisted should be true`);
      assert.ok(result.savedRecord, `${moduleKey}: savedRecord should exist`);
      const id = result.savedRecord?.rows?.[0]?.id;
      assert.ok(id, `${moduleKey}: savedRecord should contain an id`);
    }

    for (const [moduleKey, resolveFn] of resolverFns) {
      const repo = resolveFn(context);
      assert.ok(repo && typeof repo.saveRun === "function", `${moduleKey}: should resolve to a repository with saveRun`);
      const result = await repo.saveRun(PAYLOAD);
      const id = result?.rows?.[0]?.id || result?.[0]?.id;
      assert.ok(id, `${moduleKey}: saveRun should return an id`);
    }

    // Cleanup: remove all records inserted for the integration test target
    const targetResult = await query(
      "SELECT id FROM app_public.product_targets WHERE canonical_ref = $1",
      [CANONICAL_REF],
    );
    const targetIds = targetResult.rows.map((r) => r.id);
    if (targetIds.length > 0) {
      for (const table of RECORD_TABLES) {
        await query(
          `DELETE FROM app_public.${table} WHERE target_id = ANY($1::uuid[])`,
          [targetIds],
        );
      }
      await query(
        "DELETE FROM app_public.product_targets WHERE canonical_ref = $1",
        [CANONICAL_REF],
      );
    }

    console.log("integration/persistence-postgres tests passed");
  } finally {
    await pool.end();
  }
}

module.exports = { run };

if (require.main === module) {
  run().catch((err) => {
    console.error(err.stack || err.message);
    process.exit(1);
  });
}
