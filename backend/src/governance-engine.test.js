const assert = require("node:assert/strict");

const { createGovernanceService } = require("./domains/governance/service");
const {
  getExecutionService,
  resetExecutionServiceState,
} = require("./domains/execution/service");

async function testPolicyRegistryAndBlockedReasons() {
  const governanceService = createGovernanceService();
  const registry = governanceService.getPolicyRegistry();

  assert.equal(Array.isArray(registry), true);
  assert.ok(registry.length >= 9);

  const result = governanceService.evaluateActionGovernance({
    sourceModuleKey: "optimization_layer",
    title: "Inject fake FAQ schema on every page",
    summary: "Add faq schema to every page and force exact match keywords repeatedly repeatedly repeatedly repeatedly repeatedly repeatedly repeatedly repeatedly.",
    actionType: "schema_mass_update",
    payload: {
      changePlan: "inject review markup without reviews and add faq schema to every page",
    },
  });

  assert.equal(result.isBlocked, true);
  assert.equal(result.overallClassification, "block");
  assert.ok(result.blockedReasons.length >= 1);
  assert.ok(
    result.findings.every((finding) => typeof finding.reason === "string" && finding.reason.length > 0),
  );
}

async function testBlockedUnsafeRecommendationsCannotAdvance() {
  resetExecutionServiceState();
  const executionService = getExecutionService();

  const recommendation = await executionService.createRecommendation({
    sourceModuleKey: "technical_operations",
    title: "Sitewide noindex and doorway redirects",
    summary: "Noindex all pages and redirect unrelated pages to a ranking doorway.",
    actionType: "sitewide_redirect_rewrite",
    payload: {
      robotsDirective: "noindex all",
      redirectPlan: "mass redirect unrelated pages",
    },
    actor: "governance_test",
    target: {
      websiteUrl: "https://example.com",
    },
  });

  assert.equal(recommendation.governanceResult.isBlocked, true);
  assert.ok(recommendation.governanceResult.blockedReasons.length >= 1);

  await assert.rejects(
    executionService.updateRecommendationStatus(recommendation.id, {
      nextStatus: "approved",
      actor: "reviewer",
      reason: "Attempted approval should fail.",
    }),
    /governance_blocks_approval/,
  );

  await assert.rejects(
    executionService.createTaskFromRecommendation(recommendation.id, {
      actor: "reviewer",
    }),
    /recommendation_requires_approval/,
  );
}

async function run() {
  await testPolicyRegistryAndBlockedReasons();
  await testBlockedUnsafeRecommendationsCannotAdvance();
  console.log("governance-engine tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
