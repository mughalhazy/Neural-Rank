const { randomUUID } = require("node:crypto");
const { normalizeProductTarget, normalizeText } = require("../../core/targeting");

function createRecommendationRecord({
  sourceModuleKey,
  title,
  summary,
  actionType,
  payload = {},
  actor = "system",
  target = {},
  governanceResult = null,
  score = null,
}) {
  const createdAt = new Date().toISOString();

  return {
    id: randomUUID(),
    sourceModuleKey: normalizeText(sourceModuleKey) || "unknown_module",
    title: normalizeText(title) || "Untitled recommendation",
    summary: normalizeText(summary) || "",
    actionType: normalizeText(actionType) || "unspecified_action",
    payload,
    target: normalizeProductTarget(target),
    currentStatus: "recommended",
    approvalStatus: "recommended",
    executionStatus: null,
    verificationStatus: null,
    rollbackMetadata: {},
    governanceResult,
    score,
    taskId: null,
    createdAt,
    updatedAt: createdAt,
    createdBy: normalizeText(actor) || "system",
  };
}

function createTaskRecord({
  recommendation,
  actor = "system",
  rollbackMetadata = {},
}) {
  const createdAt = new Date().toISOString();

  return {
    id: randomUUID(),
    recommendationId: recommendation.id,
    sourceModuleKey: recommendation.sourceModuleKey,
    title: recommendation.title,
    summary: recommendation.summary,
    actionType: recommendation.actionType,
    payload: recommendation.payload,
    target: recommendation.target,
    currentStatus: "queued",
    approvalStatus: "approved",
    executionStatus: "queued",
    verificationStatus: null,
    rollbackMetadata,
    governanceResult: recommendation.governanceResult,
    score: recommendation.score,
    createdAt,
    updatedAt: createdAt,
    createdBy: normalizeText(actor) || "system",
  };
}

function deriveTaskState(currentTask, nextStatus, rollbackMetadata) {
  return {
    currentStatus: nextStatus,
    approvalStatus: currentTask.approvalStatus,
    executionStatus:
      nextStatus === "queued" ||
      nextStatus === "executed" ||
      nextStatus === "failed" ||
      nextStatus === "rolled_back"
        ? nextStatus
        : currentTask.executionStatus,
    verificationStatus:
      nextStatus === "verified" || nextStatus === "failed"
        ? nextStatus
        : currentTask.verificationStatus,
    rollbackMetadata:
      nextStatus === "rolled_back"
        ? rollbackMetadata || currentTask.rollbackMetadata || {}
        : currentTask.rollbackMetadata || {},
    governanceResult: currentTask.governanceResult || null,
    score: currentTask.score || null,
  };
}

module.exports = {
  createRecommendationRecord,
  createTaskRecord,
  deriveTaskState,
};
