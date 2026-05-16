const { measurementContract } = require("./contract");
const { getMetricSourceRegistry } = require("./metricSourceRegistry");
const {
  buildMeasurementSummary,
  createAttributionRecord,
  createSnapshotRecord,
} = require("./models");
const {
  createInMemoryMeasurementRepository,
  createPostgresMeasurementRepository,
} = require("./repository");

const IMPACT_CLASSIFICATIONS = Object.freeze([
  "unknown",
  "observed_correlation",
  "confirmed_impact",
]);

const defaultMeasurementRepository = createInMemoryMeasurementRepository();

function resolveRepository(context = {}) {
  if (context.measurementRepository) {
    return context.measurementRepository;
  }

  if (context.query || context.db?.query || context.pg?.query) {
    return createPostgresMeasurementRepository(context);
  }

  return defaultMeasurementRepository;
}

function assertSnapshotKind(snapshotKind) {
  if (snapshotKind !== "baseline" && snapshotKind !== "post_change") {
    throw new Error("invalid_snapshot_kind");
  }
}

function assertMetricId(metricId) {
  const registry = getMetricSourceRegistry();
  if (!registry.some((entry) => entry.metricId === metricId)) {
    throw new Error("unknown_metric_id");
  }
}

function assertImpactClassification(impactClassification) {
  if (!IMPACT_CLASSIFICATIONS.includes(impactClassification)) {
    throw new Error("invalid_impact_classification");
  }
}

async function ensureMetricSources(context = {}) {
  const repository = resolveRepository(context);

  for (const metricSource of getMetricSourceRegistry()) {
    await repository.upsertMetricSource(metricSource);
  }

  return repository.listMetricSources();
}

async function listMetricSources(context = {}) {
  return ensureMetricSources(context);
}

async function recordBaselineSnapshot(input = {}, context = {}) {
  assertMetricId(input.metricId);
  assertSnapshotKind("baseline");
  const repository = resolveRepository(context);
  const snapshot = createSnapshotRecord({
    ...input,
    snapshotKind: "baseline",
  });

  return repository.createSnapshot(snapshot);
}

async function recordPostChangeSnapshot(input = {}, context = {}) {
  assertMetricId(input.metricId);
  assertSnapshotKind("post_change");
  const repository = resolveRepository(context);
  const snapshot = createSnapshotRecord({
    ...input,
    snapshotKind: "post_change",
  });

  return repository.createSnapshot(snapshot);
}

async function recordAttributionLink(input = {}, context = {}) {
  assertMetricId(input.metricId);
  assertImpactClassification(input.impactClassification || "unknown");
  const repository = resolveRepository(context);
  const attribution = createAttributionRecord({
    ...input,
    impactClassification: input.impactClassification || "unknown",
  });

  return repository.createAttribution(attribution);
}

async function getMeasurementSummary(attributionId, context = {}) {
  const repository = resolveRepository(context);
  const attribution = await repository.getAttribution(attributionId);

  if (!attribution) {
    throw new Error("measurement_attribution_not_found");
  }

  const metricSource = getMetricSourceRegistry().find(
    (entry) => entry.metricId === attribution.metricId,
  ) || null;
  const baselineSnapshot = attribution.baselineSnapshotId
    ? await repository.getSnapshot(attribution.baselineSnapshotId)
    : null;
  const postChangeSnapshot = attribution.postChangeSnapshotId
    ? await repository.getSnapshot(attribution.postChangeSnapshotId)
    : null;

  return buildMeasurementSummary({
    metricSource,
    attribution,
    baselineSnapshot,
    postChangeSnapshot,
  });
}

function createMeasurementService() {
  return {
    contract: measurementContract,
    compatibilityAdapters: {},
    ensureMetricSources,
    listMetricSources,
    recordBaselineSnapshot,
    recordPostChangeSnapshot,
    recordAttributionLink,
    getMeasurementSummary,
  };
}

function resetMeasurementServiceState() {
  if (typeof defaultMeasurementRepository.reset === "function") {
    defaultMeasurementRepository.reset();
  }
}

module.exports = {
  createMeasurementService,
  resetMeasurementServiceState,
};
