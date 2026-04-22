const assert = require("node:assert/strict");

const backend = require("./index");

function buildModuleInputs() {
  return {
    review_analysis: {
      websiteUrl: "https://example.com",
      reviews: [
        { rating: 1, text: "slow crashes billing broken refund issue" },
      ],
    },
    content_listing_insights: {
      websiteUrl: "https://example.com",
      pageTitle: "SEO platform for growth teams",
      metaDescription: "",
      headings: ["Track rankings faster"],
      bodyText: "Short body",
      targetKeywords: ["seo", "rank tracking", "aso"],
    },
    keyword_analysis: {
      websiteUrl: "https://example.com",
      keywords: [
        { keyword: "seo tool", position: 25, difficulty: 18, volume: 1200 },
        { keyword: "aso platform", position: 42, difficulty: 14, volume: 900 },
      ],
    },
    rank_tracking: {
      websiteUrl: "https://example.com",
      rankEntries: [
        { keyword: "seo tool", currentRank: 20, previousRank: 8 },
        { keyword: "aso tool", currentRank: 11, previousRank: 25 },
      ],
    },
    competitor_analysis: {
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
    optimization_layer: {
      websiteUrl: "https://example.com",
      sections: [
        {
          title: "SEO platform",
          content: "Short body",
          metadata: { title: "", description: "" },
        },
      ],
      targetKeywords: ["seo", "rank tracking", "aso"],
    },
    creative_messaging_layer: {
      websiteUrl: "https://example.com",
      assets: [
        {
          headline: "",
          body: "Short body",
          callToAction: "",
        },
      ],
      targetThemes: ["seo", "growth"],
    },
    unified_workflow_layer: {
      websiteUrl: "https://example.com",
    },
  };
}

function assertFlowShape(moduleKey, result) {
  assert.equal(result.status, "completed", `${moduleKey} should complete`);
  assert.ok(result.flow, `${moduleKey} should expose flow`);
  assert.ok("input" in result.flow, `${moduleKey} should expose flow.input`);
  assert.ok("analysis" in result.flow, `${moduleKey} should expose flow.analysis`);
  assert.ok(Array.isArray(result.flow.insight), `${moduleKey} should expose flow.insight`);
  assert.ok(Array.isArray(result.flow.priority), `${moduleKey} should expose flow.priority`);
  assert.ok(Array.isArray(result.flow.action), `${moduleKey} should expose flow.action`);
  assert.ok(result.flow.action.length >= 1, `${moduleKey} should expose at least one action`);
}

function testDefaultActivationState() {
  const activationState = backend.getDefaultActivationState();
  const grouped = backend.listModulesByActivation();

  assert.equal(Object.keys(activationState).length, 8);
  Object.values(activationState).forEach((isActive) => assert.equal(isActive, true));
  assert.equal(grouped.active.length, 8);
  assert.equal(grouped.inactive.length, 0);
}

async function testDefaultOrchestrationAndFlowContracts() {
  const result = await backend.runDefaultBackendFlow(buildModuleInputs(), {});
  const moduleKeys = Object.keys(result.results);

  assert.equal(moduleKeys.length, 8);
  moduleKeys.forEach((moduleKey) => assertFlowShape(moduleKey, result.results[moduleKey]));
  assert.equal(result.results.unified_workflow_layer.flow.input.moduleResults.length, 7);
}

async function testActivationAwareFlowStillSupportsExplicitOverridesWithoutBreakingDefaults() {
  const result = await backend.runActivationAwareFlow(
    buildModuleInputs(),
    {},
    { unified_workflow_layer: true },
    {},
  );

  assert.equal(Object.keys(result.results).length, 8);
  assertFlowShape("unified_workflow_layer", result.results.unified_workflow_layer);
}

async function testIntegrationBoundaryTransparency() {
  const reviewResult = await backend.getModuleService("review_analysis").run(
    { appId: "com.example.app" },
    {},
  );

  assert.equal(reviewResult.integrationStatus, "integration_incomplete");
  assert.equal(reviewResult.flow.input.reviews.length, 0);
  assert.ok(reviewResult.flow.action.length >= 1);
}

async function testCrossModulePrioritizationOrdering() {
  const result = await backend.getModuleService("unified_workflow_layer").run(
    {
      websiteUrl: "https://example.com",
      moduleResults: [
        {
          moduleKey: "keyword_analysis",
          flow: {
            insight: [{ type: "keyword_summary" }],
            priority: [{ type: "keyword", priority: "high", keyword: "seo tool" }],
            action: [{ type: "keyword_action", priority: "high", action: "Do keyword work", keyword: "seo tool" }],
          },
        },
        {
          moduleKey: "review_analysis",
          flow: {
            insight: [{ type: "review_summary" }],
            priority: [{ type: "review", priority: "medium", clusterKey: "billing" }],
            action: [{ type: "review_action", priority: "medium", action: "Do review work", clusterKey: "billing" }],
          },
        },
      ],
    },
    {},
  );

  assert.equal(result.flow.priority[0].priority, "high");
  assert.equal(result.flow.priority[0].moduleKey, "keyword_analysis");
  assert.equal(result.flow.action[0].priority, "high");
}

async function run() {
  testDefaultActivationState();
  await testDefaultOrchestrationAndFlowContracts();
  await testActivationAwareFlowStillSupportsExplicitOverridesWithoutBreakingDefaults();
  await testIntegrationBoundaryTransparency();
  await testCrossModulePrioritizationOrdering();
  console.log("shared-backend tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
