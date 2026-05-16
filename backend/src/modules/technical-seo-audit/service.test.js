const assert = require("node:assert/strict");

const { runTechnicalSeoAudit } = require("./service");

async function testStructuredAuditInputProducesPrioritizedActions() {
  const result = await runTechnicalSeoAudit(
    {
      websiteUrl: "https://example.com",
      url: "https://example.com",
      crawlData: [
        { url: "https://example.com/broken", statusCode: 404 },
        { url: "https://example.com/no-title", statusCode: 200, title: "" },
        { url: "https://example.com/redirect", statusCode: 301 },
      ],
      pageSpeedData: { lcp: 5200, cls: 0.35, inp: 650 },
      robotsData: { disallowedPaths: ["/admin"], hasSitemapReference: false },
      schemaData: [],
    },
    {},
  );

  assert.equal(result.moduleKey, "technical_seo_audit");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.ok(result.flow.analysis);
  assert.ok(result.flow.insight.length >= 1);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.actionResult.status, "actions_prioritized");
}

async function testAdapterFallbackProvidesTechnicalAuditInput() {
  const result = await runTechnicalSeoAudit(
    { websiteUrl: "https://example.com" },
    {
      integrationOverrides: {
        technical_seo_audit: {
          async normalizeInput() {
            return {
              status: "adapter_supplied",
              normalizedPayload: {
                url: "https://example.com",
                crawlData: [{ url: "https://example.com/missing", statusCode: 404 }],
                pageSpeedData: { lcp: 4500, cls: 0.3, inp: 600 },
              },
            };
          },
        },
      },
    },
  );

  assert.equal(result.integrationStatus, "adapter_supplied");
  assert.ok(result.flow.action.length >= 1);
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runTechnicalSeoAudit(
    {
      websiteUrl: "https://example.com",
      url: "https://example.com",
      crawlData: [{ url: "https://example.com/broken", statusCode: 404 }],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) return { rows: [{ id: 31 }] };
        return { rows: [{ id: 88 }] };
      },
    },
  );

  assert.equal(result.persistence.persisted, true);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.technical_seo_audit_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
}

async function run() {
  await testStructuredAuditInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesTechnicalAuditInput();
  await testQueryBackedPersistencePath();
  console.log("technical-seo-audit tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
