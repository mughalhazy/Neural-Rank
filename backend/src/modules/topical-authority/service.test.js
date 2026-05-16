const assert = require("node:assert/strict");

const { runTopicalAuthority } = require("./service");

async function testStructuredTopicalInputProducesPrioritizedActions() {
  const result = await runTopicalAuthority(
    {
      websiteUrl: "https://example.com",
      targetTopics: [
        { topicKey: "seo", subtopics: ["technical seo", "on-page seo", "link building", "local seo"] },
        { topicKey: "content marketing", subtopics: ["blog strategy", "content calendar", "topic clusters"] },
      ],
      competitorTopics: [
        { competitorRef: "competitor-a.com", topics: ["seo", "content marketing", "ppc", "analytics"] },
      ],
      existingContent: [
        { url: "https://example.com/guide/technical-seo", topicKey: "seo", subtopicKey: "technical seo", wordCount: 2400, hasSchema: true },
        { url: "https://example.com/blog/link-building", topicKey: "seo", subtopicKey: "link building", wordCount: 900, hasSchema: false },
      ],
    },
    {},
  );

  assert.equal(result.moduleKey, "topical_authority");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.targetTopics.length, 2);
  assert.ok(result.flow.insight.length >= 1);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.actionResult.status, "actions_prioritized");
}

async function testAdapterFallbackProvidesTopicalInput() {
  const result = await runTopicalAuthority(
    { websiteUrl: "https://example.com" },
    {
      integrationOverrides: {
        topical_authority: {
          async normalizeInput() {
            return {
              status: "adapter_supplied",
              normalizedPayload: {
                targetTopics: [
                  { topicKey: "seo analytics", subtopics: ["rank tracking", "traffic analysis"] },
                ],
                existingContent: [
                  { url: "https://example.com/analytics", topicKey: "seo analytics", subtopicKey: "rank tracking", wordCount: 1200, hasSchema: false },
                ],
                competitorTopics: [],
              },
            };
          },
        },
      },
    },
  );

  assert.equal(result.integrationStatus, "adapter_supplied");
  assert.equal(result.flow.input.targetTopics.length, 1);
  assert.ok(result.flow.action.length >= 1);
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runTopicalAuthority(
    {
      websiteUrl: "https://example.com",
      targetTopics: [
        { topicKey: "seo", subtopics: ["on-page seo", "technical seo"] },
      ],
      existingContent: [
        { url: "https://example.com/blog/seo-basics", topicKey: "seo", subtopicKey: "on-page seo", wordCount: 800, hasSchema: false },
      ],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) return { rows: [{ id: 38 }] };
        return { rows: [{ id: 92 }] };
      },
    },
  );

  assert.equal(result.persistence.persisted, true);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.topical_authority_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
}

async function run() {
  await testStructuredTopicalInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesTopicalInput();
  await testQueryBackedPersistencePath();
  console.log("topical-authority tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
