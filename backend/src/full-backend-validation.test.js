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
  ["shared-backend.test.js", require("./shared-backend.test.js")],
];

async function run() {
  assert.equal(TEST_SUITES.length, 9, "full backend validation should cover all module tests and the shared test");

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
