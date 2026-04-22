const assert = require("node:assert/strict");

const { runCompetitorAnalysis } = require("./service");
const {
  getDefaultActivationState,
} = require("../../core/activation");

async function testStructuredCompetitorInputProducesPrioritizedActions() {
  const result = await runCompetitorAnalysis(
    {
      websiteUrl: "https://example.com",
      competitors: [
        {
          name: "Comp A",
          keywordCoverageScore: 80,
          contentCoverageScore: 70,
          rankVisibilityScore: 90,
          reviewSignalScore: 60,
        },
        {
          name: "Comp B",
          keywordCoverageScore: 55,
          contentCoverageScore: 52,
          rankVisibilityScore: 40,
          reviewSignalScore: 30,
        },
      ],
      targetKeywordCoverageScore: 50,
      targetContentCoverageScore: 45,
      targetRankVisibilityScore: 50,
      targetReviewSignalScore: 25,
    },
    {},
  );

  assert.equal(result.moduleKey, "competitor_analysis");
  assert.equal(result.status, "completed");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.competitors.length, 2);
  assert.ok(result.flow.insight.length >= 1);
  assert.ok(result.flow.action.length >= 1);
  assert.equal(result.flow.action[0].priority, "high");
}

async function testAdapterFallbackProvidesCompetitorInput() {
  const result = await runCompetitorAnalysis(
    {
      appId: "com.example.app",
    },
    {
      integrationOverrides: {
        competitor_analysis: {
          async collect() {
            return {
              status: "adapter_supplied",
              competitors: [
                {
                  name: "Comp A",
                  keywordCoverageScore: 80,
                  contentCoverageScore: 70,
                  rankVisibilityScore: 90,
                  reviewSignalScore: 60,
                },
              ],
            };
          },
        },
      },
    },
  );

  assert.equal(result.integrationStatus, "adapter_supplied");
  assert.equal(result.flow.input.competitors.length, 1);
  assert.ok(result.flow.action.length >= 1);
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runCompetitorAnalysis(
    {
      websiteUrl: "https://example.com",
      competitors: [
        {
          name: "Comp A",
          keywordCoverageScore: 80,
          contentCoverageScore: 70,
          rankVisibilityScore: 90,
          reviewSignalScore: 60,
        },
      ],
      targetKeywordCoverageScore: 50,
      targetContentCoverageScore: 45,
      targetRankVisibilityScore: 50,
      targetReviewSignalScore: 25,
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) {
          return { rows: [{ id: 41 }] };
        }

        return { rows: [{ id: 93 }] };
      },
    },
  );

  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.competitor_analysis_records/i);
  assert.equal(queries[0].params[0], "https://example.com");
  assert.equal(queries[1].params[1], "competitor_analysis");
  assert.ok(result.flow.action.length >= 1);
}

function testCompetitorIsActiveByDefault() {
  const activationState = getDefaultActivationState();
  assert.equal(activationState.competitor_analysis, true);
}

async function run() {
  testCompetitorIsActiveByDefault();
  await testStructuredCompetitorInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesCompetitorInput();
  await testQueryBackedPersistencePath();
  console.log("competitor-analysis tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
