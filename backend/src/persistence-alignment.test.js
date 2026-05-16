const assert = require("node:assert/strict");

const {
  createPostgresReviewAnalysisRepository,
} = require("./modules/review-analysis/repository");
const {
  createPostgresContentListingInsightsRepository,
} = require("./modules/content-listing-insights/repository");
const {
  createPostgresKeywordAnalysisRepository,
} = require("./modules/keyword-analysis/repository");
const {
  createPostgresRankTrackingRepository,
} = require("./modules/rank-tracking/repository");
const {
  createQueryBackedRepository: createCompetitorAnalysisRepository,
} = require("./modules/competitor-analysis/repository");
const {
  createQueryBackedRepository: createOptimizationLayerRepository,
} = require("./modules/optimization-layer/repository");
const {
  createQueryBackedRepository: createCreativeMessagingLayerRepository,
} = require("./modules/creative-messaging-layer/repository");
const {
  createQueryBackedRepository: createUnifiedWorkflowLayerRepository,
} = require("./modules/unified-workflow-layer/repository");

const REPOSITORY_FACTORIES = [
  ["review_analysis_records", createPostgresReviewAnalysisRepository],
  ["content_listing_insight_records", createPostgresContentListingInsightsRepository],
  ["keyword_analysis_records", createPostgresKeywordAnalysisRepository],
  ["rank_tracking_records", createPostgresRankTrackingRepository],
  ["competitor_analysis_records", createCompetitorAnalysisRepository],
  ["optimization_layer_records", createOptimizationLayerRepository],
  ["creative_messaging_layer_records", createCreativeMessagingLayerRepository],
  ["unified_workflow_layer_records", createUnifiedWorkflowLayerRepository],
];

function buildPayload() {
  return {
    productTarget: {
      targetRef: "https://example.com",
      targetType: "product_target",
      websiteUrl: "https://example.com",
      appId: null,
      appStoreUrl: null,
      playStoreUrl: null,
    },
    inputPayload: { input: true },
    analysisPayload: { analysis: true },
    insightPayload: [{ insight: true }],
    priorityPayload: [{ priority: "high" }],
    actionPayload: [{ action: "Do the thing" }],
  };
}

async function testRepositoryFactory(recordsTable, factory) {
  const queries = [];
  const repository = factory(async (sql, params) => {
    queries.push({ sql, params });
    return queries.length === 1 ? { rows: [{ id: "target-1" }] } : { rows: [{ id: "record-1" }] };
  });

  await repository.saveRun(buildPayload());

  assert.equal(queries.length, 2, `${recordsTable} should issue exactly two queries`);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[0].sql, /target_kind/i);
  assert.match(queries[0].sql, /canonical_ref/i);
  assert.doesNotMatch(queries[0].sql, /target_ref/i);
  assert.doesNotMatch(queries[0].sql, /target_type/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");

  assert.match(queries[1].sql, new RegExp(`insert into app_public\\.${recordsTable}`, "i"));
  assert.match(queries[1].sql, /target_id/i);
  assert.match(queries[1].sql, /integration_state/i);
  assert.match(queries[1].sql, /actions_payload/i);
  assert.doesNotMatch(queries[1].sql, /product_target_id/i);
  assert.doesNotMatch(queries[1].sql, /module_key/i);
  assert.equal(queries[1].params[0], "target-1");
  assert.equal(queries[1].params[1], "internal_only");
  assert.equal(queries[1].params[7], "completed");
}

async function run() {
  for (const [recordsTable, factory] of REPOSITORY_FACTORIES) {
    await testRepositoryFactory(recordsTable, factory);
  }

  console.log("persistence-alignment tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
