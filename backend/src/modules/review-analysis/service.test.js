const assert = require("node:assert/strict");

const { runReviewAnalysis } = require("./service");

async function testDirectReviewsProducePrioritizedActions() {
  const result = await runReviewAnalysis(
    {
      websiteUrl: "https://example.com",
      reviews: [
        { rating: 1, text: "The app is slow and crashes during checkout." },
        { rating: 2, text: "Broken billing flow and refund handling is confusing." },
        { rating: 3, text: "Please add export support. Support is slow to respond." },
      ],
    },
    {},
  );

  assert.equal(result.moduleKey, "review_analysis");
  assert.equal(result.status, "completed");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.reviews.length, 3);
  assert.ok(result.flow.analysis.complaintClusters.length >= 2);
  assert.ok(result.flow.insight.length >= 2);
  assert.ok(result.flow.priority.length >= 1);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.actionResult.status, "actions_prioritized");
  assert.notEqual(result.flow.action[0].type, "review_analysis_follow_up");
}

async function testAdapterFallbackProvidesReviewInput() {
  const result = await runReviewAnalysis(
    {
      appId: "com.example.app",
    },
    {
      integrationOverrides: {
        review_analysis: {
          async normalizeInput() {
            return {
              status: "adapter_supplied",
              normalizedPayload: {
                reviews: [
                  { id: "r1", rating: 1, text: "Crashes and freezes constantly." },
                ],
              },
            };
          },
        },
      },
    },
  );

  assert.equal(result.integrationStatus, "adapter_supplied");
  assert.equal(result.flow.input.reviews.length, 1);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.status, "completed");
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runReviewAnalysis(
    {
      websiteUrl: "https://example.com",
      reviews: [{ rating: 1, text: "Slow, broken checkout experience." }],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) {
          return { rows: [{ id: 42 }] };
        }

        return { rows: [{ id: 99 }] };
      },
    },
  );

  assert.equal(result.persistence.persisted, true);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.review_analysis_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
}

async function run() {
  await testDirectReviewsProducePrioritizedActions();
  await testAdapterFallbackProvidesReviewInput();
  await testQueryBackedPersistencePath();
  console.log("review-analysis tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
