const assert = require("node:assert/strict");

const { runSearchIntentClassifier } = require("./service");

async function testStructuredKeywordIntentInputProducesPrioritizedActions() {
  const result = await runSearchIntentClassifier(
    {
      websiteUrl: "https://example.com",
      keywords: [
        { keyword: "best seo platform", existingContentType: "product" },
        { keyword: "how to improve seo rankings", existingContentType: "product" },
        { keyword: "buy seo software annual plan", existingContentType: "blog" },
        { keyword: "seo tool comparison 2025", existingContentType: null },
      ],
    },
    {},
  );

  assert.equal(result.moduleKey, "search_intent_classifier");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.keywords.length, 4);
  assert.ok(result.flow.analysis.classifiedKeywords.length >= 1);
  assert.ok(result.flow.insight.length >= 1);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.actionResult.status, "actions_prioritized");
}

async function testAdapterFallbackProvidesIntentInput() {
  const result = await runSearchIntentClassifier(
    { websiteUrl: "https://example.com" },
    {
      integrationOverrides: {
        search_intent_classifier: {
          async normalizeInput() {
            return {
              status: "adapter_supplied",
              normalizedPayload: {
                keywords: [
                  { keyword: "seo audit tool", existingContentType: "homepage" },
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

  const result = await runSearchIntentClassifier(
    {
      websiteUrl: "https://example.com",
      keywords: [
        { keyword: "seo platform reviews", existingContentType: "comparison" },
        { keyword: "what is seo" },
      ],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) return { rows: [{ id: 33 }] };
        return { rows: [{ id: 81 }] };
      },
    },
  );

  assert.equal(result.persistence.persisted, true);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.search_intent_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
}

async function run() {
  await testStructuredKeywordIntentInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesIntentInput();
  await testQueryBackedPersistencePath();
  console.log("search-intent-classifier tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
