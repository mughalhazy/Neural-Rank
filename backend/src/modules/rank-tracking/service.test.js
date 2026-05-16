const assert = require("node:assert/strict");

const { runRankTracking } = require("./service");

async function testStructuredRankInputProducesPrioritizedActions() {
  const result = await runRankTracking(
    {
      websiteUrl: "https://example.com",
      rankEntries: [
        { keyword: "seo tool", currentRank: 20, previousRank: 8 },
        { keyword: "aso tool", currentRank: 11, previousRank: 25 },
      ],
    },
    {},
  );

  assert.equal(result.moduleKey, "rank_tracking");
  assert.equal(result.status, "completed");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.rankEntries.length, 2);
  assert.ok(result.flow.insight.length >= 2);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.actionResult.status, "actions_prioritized");
  assert.equal(result.flow.action[0].type, "investigate_rank_decline");
}

async function testAdapterFallbackProvidesRankInput() {
  const result = await runRankTracking(
    {
      appId: "com.example.app",
    },
    {
      integrationOverrides: {
        rank_tracking: {
          async normalizeInput() {
            return {
              status: "adapter_supplied",
              normalizedPayload: {
                rankEntries: [
                  { keyword: "mobile seo", currentRank: 40, previousRank: 31 },
                ],
              },
            };
          },
        },
      },
    },
  );

  assert.equal(result.integrationStatus, "adapter_supplied");
  assert.equal(result.flow.input.rankEntries.length, 1);
  assert.ok(result.flow.action.length >= 1);
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runRankTracking(
    {
      websiteUrl: "https://example.com",
      rankEntries: [{ keyword: "seo tool", currentRank: 20, previousRank: 8 }],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) {
          return { rows: [{ id: 31 }] };
        }

        return { rows: [{ id: 66 }] };
      },
    },
  );

  assert.equal(result.persistence.persisted, true);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.rank_tracking_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
}

async function run() {
  await testStructuredRankInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesRankInput();
  await testQueryBackedPersistencePath();
  console.log("rank-tracking tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
