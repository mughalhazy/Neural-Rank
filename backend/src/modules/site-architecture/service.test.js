const assert = require("node:assert/strict");

const { runSiteArchitecture } = require("./service");

async function testStructuredArchitectureInputProducesPrioritizedActions() {
  const result = await runSiteArchitecture(
    {
      websiteUrl: "https://example.com",
      pages: [
        { url: "https://example.com/", depth: 1, inboundInternalLinks: 0, outboundInternalLinks: 10, wordCount: 500 },
        { url: "https://example.com/features", depth: 2, inboundInternalLinks: 4, outboundInternalLinks: 6, wordCount: 1200 },
        { url: "https://example.com/blog", depth: 2, inboundInternalLinks: 2, outboundInternalLinks: 18, wordCount: 300 },
        { url: "https://example.com/blog/deep/very/nested/article", depth: 6, inboundInternalLinks: 0, outboundInternalLinks: 2, wordCount: 1800 },
        { url: "https://example.com/orphan-page", depth: 3, inboundInternalLinks: 0, outboundInternalLinks: 0, wordCount: 600 },
      ],
      internalLinkGraph: [
        { sourceUrl: "https://example.com/", targetUrl: "https://example.com/features", anchorText: "features" },
        { sourceUrl: "https://example.com/", targetUrl: "https://example.com/blog", anchorText: "blog" },
      ],
    },
    {},
  );

  assert.equal(result.moduleKey, "site_architecture");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.pages.length, 5);
  assert.ok(result.flow.insight.length >= 1);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.actionResult.status, "actions_prioritized");
}

async function testAdapterFallbackProvidesArchitectureInput() {
  const result = await runSiteArchitecture(
    { websiteUrl: "https://example.com" },
    {
      integrationOverrides: {
        site_architecture: {
          async normalizeInput() {
            return {
              status: "adapter_supplied",
              normalizedPayload: {
                pages: [
                  { url: "https://example.com/page", depth: 4, inboundInternalLinks: 0, outboundInternalLinks: 1, wordCount: 200 },
                ],
                internalLinkGraph: [],
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

  const result = await runSiteArchitecture(
    {
      websiteUrl: "https://example.com",
      pages: [
        { url: "https://example.com/home", depth: 1, inboundInternalLinks: 0, outboundInternalLinks: 8, wordCount: 400 },
        { url: "https://example.com/contact", depth: 2, inboundInternalLinks: 1, outboundInternalLinks: 2, wordCount: 200 },
      ],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) return { rows: [{ id: 11 }] };
        return { rows: [{ id: 58 }] };
      },
    },
  );

  assert.equal(result.persistence.persisted, true);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.site_architecture_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
}

async function run() {
  await testStructuredArchitectureInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesArchitectureInput();
  await testQueryBackedPersistencePath();
  console.log("site-architecture tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
