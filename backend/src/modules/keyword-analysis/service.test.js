const assert = require("node:assert/strict");

const { runKeywordAnalysis } = require("./service");

async function testStructuredKeywordInputProducesPrioritizedActions() {
  const result = await runKeywordAnalysis(
    {
      websiteUrl: "https://example.com",
      keywords: [
        { keyword: "seo tool", position: 25, difficulty: 18, volume: 1200 },
        { keyword: "aso platform", position: 42, difficulty: 14, volume: 900 },
      ],
    },
    {},
  );

  assert.equal(result.moduleKey, "keyword_analysis");
  assert.equal(result.status, "completed");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.keywords.length, 2);
  assert.ok(result.flow.analysis.suggestions.length >= 2);
  assert.ok(result.flow.insight.length >= 2);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.actionResult.status, "actions_prioritized");
}

async function testAdapterFallbackProvidesKeywordInput() {
  const result = await runKeywordAnalysis(
    {
      appId: "com.example.app",
    },
    {
      integrationOverrides: {
        keyword_analysis: {
          async normalizeInput() {
            return {
              status: "adapter_supplied",
              normalizedPayload: {
                keywords: [
                  { keyword: "mobile seo", position: 35, difficulty: 12, volume: 600 },
                ],
              },
            };
          },
        },
      },
    },
  );

  assert.equal(result.integrationStatus, "adapter_supplied");
  assert.equal(result.flow.input.keywords.length, 1);
  assert.ok(result.flow.action.length >= 1);
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runKeywordAnalysis(
    {
      websiteUrl: "https://example.com",
      keywords: [{ keyword: "seo tool", position: 30, difficulty: 12, volume: 500 }],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) {
          return { rows: [{ id: 21 }] };
        }

        return { rows: [{ id: 77 }] };
      },
    },
  );

  assert.equal(result.persistence.persisted, true);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.keyword_analysis_records/i);
  assert.equal(queries[0].params[0], "https://example.com");
  assert.equal(queries[1].params[1], "keyword_analysis");
}

async function run() {
  await testStructuredKeywordInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesKeywordInput();
  await testQueryBackedPersistencePath();
  console.log("keyword-analysis tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
