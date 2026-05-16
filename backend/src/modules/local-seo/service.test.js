const assert = require("node:assert/strict");

const { runLocalSeo } = require("./service");

async function testStructuredLocalSeoInputProducesPrioritizedActions() {
  const result = await runLocalSeo(
    {
      websiteUrl: "https://example.com",
      businessName: "Example SEO Agency",
      address: "123 Main St, New York, NY 10001",
      phone: "+1-555-123-4567",
      googleBusinessProfile: {
        categorySet: true,
        hoursComplete: false,
        photosCount: 3,
        postsCount: 0,
        descriptionPresent: false,
        attributesCount: 1,
        productsComplete: false,
      },
      citations: [
        { source: "yelp", name: "Example SEO Agency", address: "123 Main St", phone: "+1-555-123-4567" },
        { source: "google", name: "Example SEO Agency", address: "123 Main Street", phone: "+1-555-123-4567" },
      ],
      localKeywords: [
        { keyword: "seo agency new york", localPackPosition: 8, organicPosition: 14 },
        { keyword: "local seo services nyc", localPackPosition: null, organicPosition: 22 },
      ],
    },
    {},
  );

  assert.equal(result.moduleKey, "local_seo");
  assert.equal(result.activeByDefault, false);
  assert.ok(result.flow);
  assert.equal(result.flow.input.businessName, "Example SEO Agency");
  assert.ok(result.flow.insight.length >= 1);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.actionResult.status, "actions_prioritized");
}

async function testAdapterFallbackProvidesLocalSeoInput() {
  const result = await runLocalSeo(
    { websiteUrl: "https://example.com" },
    {
      integrationOverrides: {
        local_seo: {
          async normalizeInput() {
            return {
              status: "adapter_supplied",
              normalizedPayload: {
                businessName: "Example Agency",
                address: "456 Broadway, New York, NY",
                phone: "+1-555-000-1111",
                citations: [
                  { source: "yelp", name: "Example Agency", address: "456 Broadway", phone: "+1-555-000-1111" },
                ],
                localKeywords: [
                  { keyword: "marketing agency nyc", localPackPosition: null, organicPosition: 18 },
                ],
              },
            };
          },
        },
      },
    },
  );

  assert.equal(result.integrationStatus, "adapter_supplied");
  assert.equal(result.flow.input.businessName, "Example Agency");
  assert.ok(result.flow.action.length >= 1);
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runLocalSeo(
    {
      websiteUrl: "https://example.com",
      businessName: "Test Business",
      citations: [
        { source: "yelp", name: "Test Business", address: "100 Test Ave", phone: "+1-555-999-0000" },
      ],
      localKeywords: [
        { keyword: "test keyword local", localPackPosition: 5, organicPosition: 10 },
      ],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) return { rows: [{ id: 16 }] };
        return { rows: [{ id: 63 }] };
      },
    },
  );

  assert.equal(result.persistence.persisted, true);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.local_seo_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
}

async function run() {
  await testStructuredLocalSeoInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesLocalSeoInput();
  await testQueryBackedPersistencePath();
  console.log("local-seo tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
