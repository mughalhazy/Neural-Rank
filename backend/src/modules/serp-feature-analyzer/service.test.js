const assert = require("node:assert/strict");

const { runSerpFeatureAnalyzer } = require("./service");

async function testStructuredSerpInputProducesPrioritizedActions() {
  const result = await runSerpFeatureAnalyzer(
    {
      websiteUrl: "https://example.com",
      serpEntries: [
        {
          keyword: "seo platform reviews",
          featuresPresent: ["featured_snippet", "people_also_ask", "sitelinks"],
          featuresOwned: [],
          position: 7,
        },
        {
          keyword: "local seo tools",
          featuresPresent: ["local_pack", "people_also_ask"],
          featuresOwned: ["people_also_ask"],
          position: 4,
        },
        {
          keyword: "best seo audit software",
          featuresPresent: ["featured_snippet", "image_carousel"],
          featuresOwned: [],
          position: 11,
        },
      ],
    },
    {},
  );

  assert.equal(result.moduleKey, "serp_feature_analyzer");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.serpEntries.length, 3);
  assert.ok(result.flow.insight.length >= 1);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.actionResult.status, "actions_prioritized");
}

async function testAdapterFallbackProvidesSerpInput() {
  const result = await runSerpFeatureAnalyzer(
    { websiteUrl: "https://example.com" },
    {
      integrationOverrides: {
        serp_feature_analyzer: {
          async normalizeInput() {
            return {
              status: "adapter_supplied",
              normalizedPayload: {
                serpEntries: [
                  {
                    keyword: "seo agency pricing",
                    featuresPresent: ["featured_snippet"],
                    featuresOwned: [],
                    position: 5,
                  },
                ],
              },
            };
          },
        },
      },
    },
  );

  assert.equal(result.integrationStatus, "adapter_supplied");
  assert.equal(result.flow.input.serpEntries.length, 1);
  assert.ok(result.flow.action.length >= 1);
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runSerpFeatureAnalyzer(
    {
      websiteUrl: "https://example.com",
      serpEntries: [
        {
          keyword: "seo tools comparison",
          featuresPresent: ["featured_snippet", "people_also_ask"],
          featuresOwned: [],
          position: 9,
        },
      ],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) return { rows: [{ id: 22 }] };
        return { rows: [{ id: 79 }] };
      },
    },
  );

  assert.equal(result.persistence.persisted, true);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.serp_feature_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
}

async function run() {
  await testStructuredSerpInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesSerpInput();
  await testQueryBackedPersistencePath();
  console.log("serp-feature-analyzer tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
