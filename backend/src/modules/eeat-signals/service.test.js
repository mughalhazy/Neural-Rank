const assert = require("node:assert/strict");

const { runEeatSignals } = require("./service");

async function testStructuredEeatInputProducesPrioritizedActions() {
  const result = await runEeatSignals(
    {
      websiteUrl: "https://example.com",
      pages: [
        {
          url: "https://example.com/guide/seo",
          hasAuthorBio: false,
          authorCredentials: [],
          hasByline: false,
          bodyContent: "This article covers SEO best practices for 2025.",
        },
        {
          url: "https://example.com/blog/link-building",
          hasAuthorBio: true,
          authorCredentials: ["SEO Specialist, 8 years"],
          hasByline: true,
          bodyContent: "In my experience testing link building strategies, I found that...",
        },
      ],
      aboutPage: { exists: true, wordCount: 200, hasTeamSection: false, hasCompanyHistory: false },
      contactPage: { exists: true, hasAddress: false, hasPhone: false, hasEmail: true },
      trustSignals: [{ type: "ssl", value: true }],
    },
    {},
  );

  assert.equal(result.moduleKey, "eeat_signals");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.pages.length, 2);
  assert.ok(result.flow.insight.length >= 1);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.actionResult.status, "actions_prioritized");
}

async function testAdapterFallbackProvidesEeatInput() {
  const result = await runEeatSignals(
    { websiteUrl: "https://example.com" },
    {
      integrationOverrides: {
        eeat_signals: {
          async normalizeInput() {
            return {
              status: "adapter_supplied",
              normalizedPayload: {
                pages: [
                  {
                    url: "https://example.com/article",
                    hasAuthorBio: false,
                    authorCredentials: [],
                    hasByline: false,
                    bodyContent: "Generic article content without author signals.",
                  },
                ],
                trustSignals: [],
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

  const result = await runEeatSignals(
    {
      websiteUrl: "https://example.com",
      pages: [
        {
          url: "https://example.com/post",
          hasAuthorBio: true,
          authorCredentials: ["PhD in Marketing"],
          hasByline: true,
          bodyContent: "According to our research, these SEO tactics improve rankings.",
        },
      ],
      trustSignals: [{ type: "ssl", value: true }, { type: "awards", value: "Best SaaS 2024" }],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) return { rows: [{ id: 27 }] };
        return { rows: [{ id: 74 }] };
      },
    },
  );

  assert.equal(result.persistence.persisted, true);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.eeat_signal_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
}

async function run() {
  await testStructuredEeatInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesEeatInput();
  await testQueryBackedPersistencePath();
  console.log("eeat-signals tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
