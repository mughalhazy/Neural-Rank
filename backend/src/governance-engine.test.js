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
  // T1-17: blocked recommendations must be rejected at creation — never stored.
  resetExecutionServiceState();
  const executionService = getExecutionService();

  await assert.rejects(
    executionService.createRecommendation({
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
    }),
    /governance_blocks_/,
  );

  // T1-16: evaluateActionGovernance correctly sets requiresApproval=false for block classifications.
  const { createGovernanceService } = require("./domains/governance/service");
  const govService = createGovernanceService();
  const result = govService.evaluateActionGovernance({
    actionType: "sitewide_redirect_rewrite",
    payload: { redirectPlan: "mass redirect unrelated pages" },
  });
  assert.equal(result.isBlocked, true);
  assert.equal(result.requiresApproval, false);
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
