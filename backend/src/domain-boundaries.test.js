const assert = require("node:assert/strict");

const backend = require("./index");

function testDomainBoundaryMap() {
  const boundaryMap = backend.getDomainBoundaryMap();

  assert.deepEqual(Object.keys(boundaryMap), [
    "site_intelligence",
    "search_intelligence",
    "content_operations",
    "technical_operations",
    "execution",
    "measurement",
    "governance",
    "business_intelligence",
  ]);

  assert.deepEqual(boundaryMap.site_intelligence.compatibilityModuleKeys, [
    "review_analysis",
    "content_listing_insights",
  ]);
  assert.deepEqual(boundaryMap.search_intelligence.compatibilityModuleKeys, [
    "keyword_analysis",
    "rank_tracking",
    "competitor_analysis",
  ]);
  assert.deepEqual(boundaryMap.content_operations.compatibilityModuleKeys, [
    "optimization_layer",
    "creative_messaging_layer",
  ]);
  assert.deepEqual(boundaryMap.execution.compatibilityModuleKeys, [
    "unified_workflow_layer",
  ]);
}

function testCentralizedTargetNormalization() {
  const websiteTarget = backend.normalizeProductTarget({
    websiteUrl: "https://example.com",
  });
  const appTarget = backend.normalizeProductTarget({
    appId: "com.example.app",
  });

  assert.equal(websiteTarget.targetRef, "https://example.com");
  assert.equal(websiteTarget.targetType, "product_target");
  assert.equal(appTarget.targetRef, "com.example.app");
  assert.equal(appTarget.targetType, "app_target");
}

async function testLegacyModulesStillRun() {
  const result = await backend.runDefaultBackendFlow(
    {
      review_analysis: {
        websiteUrl: "https://example.com",
        reviews: [{ rating: 1, text: "checkout is slow and crashes" }],
      },
    },
    {},
  );

  assert.equal(Object.keys(result.results).length, 17);
  assert.equal(result.results.review_analysis.status, "completed");
}

async function run() {
  testDomainBoundaryMap();
  testCentralizedTargetNormalization();
  await testLegacyModulesStillRun();
  console.log("domain-boundaries tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
