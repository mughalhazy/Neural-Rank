const assert = require("node:assert/strict");

const { runOnPageSeoScorer } = require("./service");

async function testStructuredPageInputProducesPrioritizedActions() {
  const result = await runOnPageSeoScorer(
    {
      websiteUrl: "https://example.com",
      pages: [
        {
          url: "https://example.com/features",
          title: "Feat",
          metaDescription: "",
          h1: "",
          bodyContent: "seo seo seo seo seo seo seo seo seo seo seo seo seo platform best seo tool",
          targetKeywords: ["seo platform"],
          wordCount: 80,
        },
        {
          url: "https://example.com/pricing",
          title: "Pricing — Example SEO Platform for Agencies",
          metaDescription: "Transparent pricing for teams of all sizes.",
          h1: "Simple Pricing",
          bodyContent: "Choose the plan that fits your agency. No hidden fees.",
          targetKeywords: ["seo platform pricing"],
          wordCount: 420,
        },
      ],
    },
    {},
  );

  assert.equal(result.moduleKey, "on_page_seo_scorer");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.pages.length, 2);
  assert.ok(result.flow.insight.length >= 1);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.actionResult.status, "actions_prioritized");
}

async function testAdapterFallbackProvidesOnPageInput() {
  const result = await runOnPageSeoScorer(
    { websiteUrl: "https://example.com" },
    {
      integrationOverrides: {
        on_page_seo_scorer: {
          async normalizeInput() {
            return {
              status: "adapter_supplied",
              normalizedPayload: {
                pages: [
                  {
                    url: "https://example.com/landing",
                    title: "Landing Page",
                    metaDescription: "",
                    h1: "",
                    bodyContent: "Short content.",
                    targetKeywords: ["landing"],
                    wordCount: 50,
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
  assert.equal(result.flow.input.pages.length, 1);
  assert.ok(result.flow.action.length >= 1);
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runOnPageSeoScorer(
    {
      websiteUrl: "https://example.com",
      pages: [
        {
          url: "https://example.com/page",
          title: "Test Page Title for SEO",
          metaDescription: "A meta description.",
          h1: "Test Heading",
          bodyContent: "Test content for on-page SEO scoring purposes.",
          targetKeywords: ["test seo"],
          wordCount: 300,
        },
      ],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) return { rows: [{ id: 14 }] };
        return { rows: [{ id: 55 }] };
      },
    },
  );

  assert.equal(result.persistence.persisted, true);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.on_page_seo_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
}

async function run() {
  await testStructuredPageInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesOnPageInput();
  await testQueryBackedPersistencePath();
  console.log("on-page-seo-scorer tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
