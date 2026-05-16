const assert = require("node:assert/strict");

const { createRecommendationScore } = require("./core/recommendationScoring");
const {
  getExecutionService,
  resetExecutionServiceState,
} = require("./domains/execution/service");

async function testStructuredScoreAndDerivedPriority() {
  const score = createRecommendationScore({
    severity: 90,
    trafficImpact: 80,
    conversionImpact: 75,
    implementationDifficulty: 20,
    confidence: 85,
    governanceRisk: 10,
    businessValue: 88,
    expectedEffort: 25,
    reversibility: 90,
    rationale: "High-value page with strong upside and low operational downside.",
  });

  assert.ok(score.overallScore >= 70);
  assert.equal(score.derivedPriority, "high");
  assert.equal(typeof score.rationale, "string");
  assert.equal(score.missingInputs.length, 0);
}

async function testUnknownInputsReduceConfidence() {
  const score = createRecommendationScore({
    severity: 60,
    trafficImpact: null,
    conversionImpact: null,
    implementationDifficulty: null,
    confidence: 80,
    governanceRisk: null,
    businessValue: null,
    expectedEffort: null,
    reversibility: null,
    rationale: "Limited evidence available.",
  });

  assert.ok(score.dimensions.confidence < 80);
  assert.ok(score.missingInputs.length >= 5);
  assert.equal(typeof score.derivedPriority, "string");
}

async function testExecutionRecommendationsCarryStructuredScore() {
  resetExecutionServiceState();
  const executionService = getExecutionService();

  const recommendation = await executionService.createRecommendation({
    sourceModuleKey: "technical_operations",
    title: "Fix canonical mismatch on pricing page",
    summary: "Canonical points away from the preferred pricing URL.",
    actionType: "canonical_review",
    payload: {
      canonical: "https://example.com/pricing-old",
    },
    target: {
      websiteUrl: "https://example.com/pricing",
    },
    score: {
      severity: 88,
      trafficImpact: 72,
      conversionImpact: 84,
      implementationDifficulty: 25,
      confidence: 82,
      businessValue: 90,
      expectedEffort: 20,
      reversibility: 95,
      rationale: "Pricing page issue affects a high-value destination.",
    },
  });

  assert.ok(recommendation.score);
  assert.equal(typeof recommendation.score.overallScore, "number");
  assert.equal(typeof recommendation.score.derivedPriority, "string");
  assert.equal(typeof recommendation.score.rationale, "string");
}

async function run() {
  await testStructuredScoreAndDerivedPriority();
  await testUnknownInputsReduceConfidence();
  await testExecutionRecommendationsCarryStructuredScore();
  console.log("recommendation-scoring tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
