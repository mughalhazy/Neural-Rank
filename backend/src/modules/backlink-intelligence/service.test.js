const assert = require("node:assert/strict");

const { runBacklinkIntelligence } = require("./service");

async function testStructuredBacklinkInputProducesPrioritizedActions() {
  const result = await runBacklinkIntelligence(
    {
      websiteUrl: "https://example.com",
      domain: "example.com",
      targetDA: 22,
      backlinks: [
        { sourceUrl: "https://lowda.site/article", domainAuthority: 8, anchorText: "example", spamScore: 40 },
        { sourceUrl: "https://spammy.biz/link", domainAuthority: 4, anchorText: "example", spamScore: 75 },
        { sourceUrl: "https://respectable.org/post", domainAuthority: 58, anchorText: "seo platform" },
      ],
      referringDomains: [
        { domain: "lowda.site", domainAuthority: 8 },
        { domain: "spammy.biz", domainAuthority: 4 },
        { domain: "respectable.org", domainAuthority: 58 },
      ],
      competitorBacklinks: [
        { domain: "techcrunch.com", domainAuthority: 90 },
        { domain: "forbes.com", domainAuthority: 94 },
      ],
    },
    {},
  );

  assert.equal(result.moduleKey, "backlink_intelligence");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.backlinks.length, 3);
  assert.ok(result.flow.insight.length >= 1);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.actionResult.status, "actions_prioritized");
}

async function testAdapterFallbackProvidesBacklinkInput() {
  const result = await runBacklinkIntelligence(
    { websiteUrl: "https://example.com" },
    {
      integrationOverrides: {
        backlink_intelligence: {
          async normalizeInput() {
            return {
              status: "adapter_supplied",
              normalizedPayload: {
                domain: "example.com",
                targetDA: 15,
                backlinks: [
                  { sourceUrl: "https://news.site/article", domainAuthority: 65, anchorText: "read more" },
                ],
                referringDomains: [{ domain: "news.site", domainAuthority: 65 }],
                competitorBacklinks: [],
              },
            };
          },
        },
      },
    },
  );

  assert.equal(result.integrationStatus, "adapter_supplied");
  assert.equal(result.flow.input.backlinks.length, 1);
  assert.ok(result.flow.action.length >= 1);
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runBacklinkIntelligence(
    {
      websiteUrl: "https://example.com",
      domain: "example.com",
      backlinks: [
        { sourceUrl: "https://blog.example.org/post", domainAuthority: 42, anchorText: "seo guide" },
      ],
      referringDomains: [{ domain: "blog.example.org", domainAuthority: 42 }],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) return { rows: [{ id: 19 }] };
        return { rows: [{ id: 67 }] };
      },
    },
  );

  assert.equal(result.persistence.persisted, true);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.backlink_intelligence_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
}

async function run() {
  await testStructuredBacklinkInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesBacklinkInput();
  await testQueryBackedPersistencePath();
  console.log("backlink-intelligence tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
