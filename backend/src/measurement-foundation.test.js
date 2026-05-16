const assert = require("node:assert/strict");

const {
  createMeasurementService,
  resetMeasurementServiceState,
} = require("./domains/measurement/service");
const {
  getExecutionService,
  resetExecutionServiceState,
} = require("./domains/execution/service");

async function testMetricRegistryAndUnknownBaselineHandling() {
  resetMeasurementServiceState();
  const measurementService = createMeasurementService();

  const metricSources = await measurementService.listMetricSources();
  assert.equal(metricSources.length, 5);
  assert.ok(metricSources.some((entry) => entry.metricId === "rankings"));
  assert.ok(metricSources.some((entry) => entry.metricId === "conversions_leads"));

  const baselineSnapshot = await measurementService.recordBaselineSnapshot({
    metricId: "traffic",
    target: {
      websiteUrl: "https://example.com",
    },
    recommendationId: null,
    taskId: null,
    changeId: "change-traffic-001",
    metricValue: null,
    sourceRef: null,
    notes: "No connected traffic source yet.",
  });

  assert.equal(baselineSnapshot.snapshotKind, "baseline");
  assert.equal(baselineSnapshot.metricValue, null);
  assert.equal(baselineSnapshot.valueStatus, "unknown");
}

async function testAttributionSummaryAnswersCoreQuestions() {
  resetMeasurementServiceState();
  resetExecutionServiceState();

  const measurementService = createMeasurementService();
  const executionService = getExecutionService();

  const recommendation = await executionService.createRecommendation({
    sourceModuleKey: "rank_tracking",
    title: "Refresh ranking landing page copy",
    summary: "Manual ranking-focused content refresh planned for one page.",
    actionType: "content_refresh_plan",
    payload: {
      keyword: "seo platform",
    },
    target: {
      websiteUrl: "https://example.com",
    },
    actor: "measurement_test",
  });

  await executionService.updateRecommendationStatus(recommendation.id, {
    nextStatus: "approved",
    actor: "reviewer",
    reason: "Approved for execution planning.",
  });

  const task = await executionService.createTaskFromRecommendation(recommendation.id, {
    actor: "reviewer",
    reason: "Create task for measured content change.",
  });

  const baselineSnapshot = await measurementService.recordBaselineSnapshot({
    metricId: "rankings",
    target: {
      websiteUrl: "https://example.com",
    },
    recommendationId: recommendation.id,
    taskId: task.id,
    changeId: "change-ranking-001",
    metricValue: 18,
    sourceRef: "gsc_placeholder",
    notes: "Observed before manual content change.",
  });

  const postChangeSnapshot = await measurementService.recordPostChangeSnapshot({
    metricId: "rankings",
    target: {
      websiteUrl: "https://example.com",
    },
    recommendationId: recommendation.id,
    taskId: task.id,
    changeId: "change-ranking-001",
    metricValue: 11,
    sourceRef: "gsc_placeholder",
    notes: "Observed after manual content change.",
  });

  const attribution = await measurementService.recordAttributionLink({
    recommendationId: recommendation.id,
    taskId: task.id,
    changeId: "change-ranking-001",
    metricId: "rankings",
    baselineSnapshotId: baselineSnapshot.id,
    postChangeSnapshotId: postChangeSnapshot.id,
    confidence: 0.6,
    impactClassification: "observed_correlation",
    rationale: "Ranking improved after the approved content change, but causality is not confirmed.",
  });

  const summary = await measurementService.getMeasurementSummary(attribution.id);

  assert.equal(summary.recommendationId, recommendation.id);
  assert.equal(summary.taskId, task.id);
  assert.equal(summary.changeId, "change-ranking-001");
  assert.equal(summary.whatMetricMoved, "rankings");
  assert.equal(summary.confidenceLevel, 0.6);
  assert.equal(summary.impactClassification, "observed_correlation");
  assert.equal(summary.whyItChanged, "Ranking improved after the approved content change, but causality is not confirmed.");
  assert.equal(summary.baselineSnapshot.metricValue, 18);
  assert.equal(summary.postChangeSnapshot.metricValue, 11);
  assert.equal(summary.observedMovement, -7);
}

async function run() {
  await testMetricRegistryAndUnknownBaselineHandling();
  await testAttributionSummaryAnswersCoreQuestions();
  console.log("measurement-foundation tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
