const assert = require("node:assert/strict");

const { runAnalyticsIntegration } = require("./service");

async function testStructuredAnalyticsInputProducesPrioritizedActions() {
  const result = await runAnalyticsIntegration(
    {
      websiteUrl: "https://example.com",
      gscData: {
        searchAnalytics: [
          { query: "seo platform", clicks: 80, impressions: 3200, ctr: 0.025, position: 6.1 },
          { query: "best seo tool 2025", clicks: 3, impressions: 1800, ctr: 0.0017, position: 14.5 },
          { query: "seo audit software", clicks: 12, impressions: 900, ctr: 0.013, position: 8.2 },
        ],
        indexCoverage: { validIndexed: 240, warnings: 18, errors: 7, excluded: 14 },
        crawlErrors: [
          { url: "https://example.com/old-page", type: "not_found", statusCode: 404 },
          { url: "https://example.com/broken", type: "server_error", statusCode: 500 },
        ],
        coreWebVitals: {},
      },
      ga4Data: {
        pageMetrics: [
          { url: "https://example.com/features", organicSessions: 620, organicSessionsPrev: 950, conversions: 8, bounceRate: 0.55 },
          { url: "https://example.com/pricing", organicSessions: 310, organicSessionsPrev: null, conversions: 0, bounceRate: 0.48 },
        ],
        totalOrganicSessions: 930,
      },
    },
    {},
  );

  assert.equal(result.moduleKey, "analytics_integration");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.gsc.searchAnalytics.length, 3);
  assert.ok(result.flow.insight.length >= 1);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.actionResult.status, "actions_prioritized");
}

async function testAdapterFallbackProvidesAnalyticsInput() {
  const result = await runAnalyticsIntegration(
    { websiteUrl: "https://example.com" },
    {
      integrationOverrides: {
        analytics_integration: {
          async normalizeInput() {
            return {
              status: "adapter_supplied",
              normalizedPayload: {
                gscData: {
                  searchAnalytics: [
                    { query: "rank tracking tool", clicks: 5, impressions: 600, ctr: 0.0083, position: 18.4 },
                  ],
                  indexCoverage: { validIndexed: 180, warnings: 5, errors: 2, excluded: 3 },
                  crawlErrors: [],
                  coreWebVitals: {},
                },
                ga4Data: { pageMetrics: [], totalOrganicSessions: null },
              },
            };
          },
        },
      },
    },
  );

  assert.equal(result.integrationStatus, "adapter_supplied");
  assert.equal(result.flow.input.gsc.searchAnalytics.length, 1);
  assert.ok(result.flow.action.length >= 1);
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runAnalyticsIntegration(
    {
      websiteUrl: "https://example.com",
      gscData: {
        searchAnalytics: [
          { query: "seo tool", clicks: 40, impressions: 1200, ctr: 0.033, position: 5.8 },
        ],
        indexCoverage: { validIndexed: 200, warnings: 8, errors: 1, excluded: 4 },
        crawlErrors: [],
        coreWebVitals: {},
      },
      ga4Data: { pageMetrics: [], totalOrganicSessions: null },
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) return { rows: [{ id: 45 }] };
        return { rows: [{ id: 96 }] };
      },
    },
  );

  assert.equal(result.persistence.persisted, true);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.analytics_integration_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
}

async function run() {
  await testStructuredAnalyticsInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesAnalyticsInput();
  await testQueryBackedPersistencePath();
  console.log("analytics-integration tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
