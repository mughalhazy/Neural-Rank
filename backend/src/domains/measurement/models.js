const { randomUUID } = require("node:crypto");
const { normalizeProductTarget, normalizeText } = require("../../core/targeting");

function normalizeMetricValue(metricValue) {
  if (metricValue === null || metricValue === undefined || metricValue === "") {
    return null;
  }

  const numericValue = Number(metricValue);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function createSnapshotRecord({
  snapshotKind,
  metricId,
  target = {},
  recommendationId = null,
  taskId = null,
  changeId = null,
  metricValue = null,
  rawValue = null,
  observedAt = new Date().toISOString(),
  sourceRef = null,
  notes = "",
}) {
  const normalizedMetricValue = normalizeMetricValue(metricValue);

  return {
    id: randomUUID(),
    snapshotKind,
    metricId: normalizeText(metricId),
    target: normalizeProductTarget(target),
    recommendationId: normalizeText(recommendationId) || null,
    taskId: normalizeText(taskId) || null,
    changeId: normalizeText(changeId) || null,
    metricValue: normalizedMetricValue,
    rawValue: rawValue === undefined ? null : rawValue,
    valueStatus: normalizedMetricValue === null ? "unknown" : "known",
    observedAt,
    sourceRef: normalizeText(sourceRef) || null,
    notes: normalizeText(notes),
    createdAt: new Date().toISOString(),
  };
}

function createAttributionRecord({
  recommendationId = null,
  taskId = null,
  changeId = null,
  metricId,
  baselineSnapshotId = null,
  postChangeSnapshotId = null,
  confidence = null,
  impactClassification = "unknown",
  rationale = "",
}) {
  return {
    id: randomUUID(),
    recommendationId: normalizeText(recommendationId) || null,
    taskId: normalizeText(taskId) || null,
    changeId: normalizeText(changeId) || null,
    metricId: normalizeText(metricId),
    baselineSnapshotId: normalizeText(baselineSnapshotId) || null,
    postChangeSnapshotId: normalizeText(postChangeSnapshotId) || null,
    confidence:
      confidence === null || confidence === undefined || confidence === ""
        ? null
        : Number(confidence),
    impactClassification,
    rationale: normalizeText(rationale),
    createdAt: new Date().toISOString(),
  };
}

function buildMeasurementSummary({
  metricSource = null,
  attribution = null,
  baselineSnapshot = null,
  postChangeSnapshot = null,
}) {
  const baselineValue = baselineSnapshot?.metricValue;
  const postChangeValue = postChangeSnapshot?.metricValue;
  const movement =
    baselineValue === null || baselineValue === undefined || postChangeValue === null || postChangeValue === undefined
      ? null
      : postChangeValue - baselineValue;

  return {
    recommendationId: attribution?.recommendationId || null,
    taskId: attribution?.taskId || null,
    changeId: attribution?.changeId || null,
    metricId: attribution?.metricId || null,
    metricDisplayName: metricSource?.displayName || null,
    impactClassification: attribution?.impactClassification || "unknown",
    confidence: attribution?.confidence ?? null,
    rationale: attribution?.rationale || "",
    whatChanged: attribution?.changeId || attribution?.taskId || attribution?.recommendationId || null,
    whenChanged: postChangeSnapshot?.observedAt || attribution?.createdAt || null,
    whyItChanged: attribution?.rationale || "",
    whatMetricMoved: attribution?.metricId || null,
    confidenceLevel: attribution?.confidence ?? null,
    baselineSnapshot,
    postChangeSnapshot,
    observedMovement: movement,
    observedMovementType:
      movement === null ? "unknown" : movement > 0 ? "increase" : movement < 0 ? "decrease" : "flat",
  };
}

module.exports = {
  buildMeasurementSummary,
  createAttributionRecord,
  createSnapshotRecord,
};
