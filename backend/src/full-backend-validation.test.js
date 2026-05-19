const assert = require("node:assert/strict");

const TEST_SUITES = [
  ["modules/review-analysis/service.test.js", require("./modules/review-analysis/service.test.js")],
  ["modules/content-listing-insights/service.test.js", require("./modules/content-listing-insights/service.test.js")],
  ["modules/keyword-analysis/service.test.js", require("./modules/keyword-analysis/service.test.js")],
  ["modules/rank-tracking/service.test.js", require("./modules/rank-tracking/service.test.js")],
  ["modules/competitor-analysis/service.test.js", require("./modules/competitor-analysis/service.test.js")],
  ["modules/optimization-layer/service.test.js", require("./modules/optimization-layer/service.test.js")],
  ["modules/creative-messaging-layer/service.test.js", require("./modules/creative-messaging-layer/service.test.js")],
  ["modules/unified-workflow-layer/service.test.js", require("./modules/unified-workflow-layer/service.test.js")],
  ["modules/technical-seo-audit/service.test.js", require("./modules/technical-seo-audit/service.test.js")],
  ["modules/on-page-seo-scorer/service.test.js", require("./modules/on-page-seo-scorer/service.test.js")],
  ["modules/backlink-intelligence/service.test.js", require("./modules/backlink-intelligence/service.test.js")],
  ["modules/eeat-signals/service.test.js", require("./modules/eeat-signals/service.test.js")],
  ["modules/search-intent-classifier/service.test.js", require("./modules/search-intent-classifier/service.test.js")],
  ["modules/serp-feature-analyzer/service.test.js", require("./modules/serp-feature-analyzer/service.test.js")],
  ["modules/topical-authority/service.test.js", require("./modules/topical-authority/service.test.js")],
  ["modules/site-architecture/service.test.js", require("./modules/site-architecture/service.test.js")],
  ["modules/analytics-integration/service.test.js", require("./modules/analytics-integration/service.test.js")],
  ["modules/local-seo/service.test.js", require("./modules/local-seo/service.test.js")],
  ["shared-backend.test.js", require("./shared-backend.test.js")],
  ["server.test.js", require("./server.test.js")],
  ["execution-lifecycle.test.js", require("./execution-lifecycle.test.js")],
  ["governance-engine.test.js", require("./governance-engine.test.js")],
  ["measurement-foundation.test.js", require("./measurement-foundation.test.js")],
  ["technical-operations.test.js", require("./technical-operations.test.js")],
  ["search-intelligence.test.js", require("./search-intelligence.test.js")],
  ["business-intelligence.test.js", require("./business-intelligence.test.js")],
  ["recommendation-scoring.test.js", require("./recommendation-scoring.test.js")],
  ["persistence-alignment.test.js", require("./persistence-alignment.test.js")],
  ["domain-boundaries.test.js", require("./domain-boundaries.test.js")],
  ["negative-path.test.js", require("./negative-path.test.js")],
];

async function run() {
  // Suite count grows as new test files are added — assert minimum, not exact.
  assert.ok(TEST_SUITES.length >= 29, `full backend validation should cover all 18 module tests plus shared/domain tests (got ${TEST_SUITES.length})`);

  for (const [relativePath, suite] of TEST_SUITES) {
    assert.equal(typeof suite.run, "function", `${relativePath} should export run()`);
    await suite.run();
  }

  console.log("full-backend-validation tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
