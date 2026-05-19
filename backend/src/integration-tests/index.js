// Runs all integration tests sequentially.
// Each test skips itself when DATABASE_URL is not set.

const suites = [
  require("./execution-postgres.test.js"),
  require("./persistence-postgres.test.js"),
];

async function run() {
  for (const suite of suites) {
    await suite.run();
  }
}

run().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
