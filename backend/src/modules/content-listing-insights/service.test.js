const assert = require("node:assert/strict");

const { runContentListingInsights } = require("./service");

async function testFlatWebsiteInputProducesPrioritizedActions() {
  const result = await runContentListingInsights(
    {
      websiteUrl: "https://example.com",
      pageTitle: "SEO platform for growth teams",
      metaDescription: "",
      headings: ["Track rankings faster"],
      bodyText: "Short body",
      targetKeywords: ["seo", "rank tracking", "aso"],
    },
    {},
  );

  assert.equal(result.moduleKey, "content_listing_insights");
  assert.equal(result.status, "completed");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.actionResult.status, "actions_prioritized");
  assert.notEqual(result.flow.action[0].type, "content_listing_follow_up");
}

async function testAdapterFallbackProvidesStructuredInput() {
  const result = await runContentListingInsights(
    {
      appId: "com.example.app",
    },
    {
      integrationOverrides: {
        content_listing_insights: {
          async normalizeInput() {
            return {
              status: "adapter_supplied",
              normalizedPayload: {
                listing: {
                  title: "App title",
                  shortDescription: "",
                  description: "Short description only",
                  keywords: ["aso", "mobile seo"],
                },
              },
            };
          },
        },
      },
    },
  );

  assert.equal(result.integrationStatus, "adapter_supplied");
  assert.ok(result.flow.input.listing.combinedText.length > 0);
  assert.ok(result.flow.action.length >= 1);
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runContentListingInsights(
    {
      websiteUrl: "https://example.com",
      pageTitle: "SEO title",
      bodyText: "Short body text",
      targetKeywords: ["seo"],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) {
          return { rows: [{ id: 12 }] };
        }

        return { rows: [{ id: 88 }] };
      },
    },
  );

  assert.equal(result.persistence.persisted, true);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.content_listing_insight_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
}

async function run() {
  await testFlatWebsiteInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesStructuredInput();
  await testQueryBackedPersistencePath();
  console.log("content-listing-insights tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
