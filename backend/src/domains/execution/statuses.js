const EXECUTION_LIFECYCLE_STATUSES = Object.freeze([
  "recommended",
  "approved",
  "rejected",
  "queued",
  "executed",
  "verified",
  "failed",
  "rolled_back",
]);

const RECOMMENDATION_STATUSES = Object.freeze([
  "recommended",
  "approved",
  "rejected",
  "queued",
]);

const TASK_STATUSES = Object.freeze([
  "queued",
  "executed",
  "verified",
  "failed",
  "rolled_back",
]);

const RECOMMENDATION_STATUS_TRANSITIONS = Object.freeze({
  recommended: Object.freeze(["approved", "rejected"]),
  approved: Object.freeze([]),
  rejected: Object.freeze([]),
  queued: Object.freeze([]),
});

const TASK_STATUS_TRANSITIONS = Object.freeze({
  queued: Object.freeze(["executed", "failed"]),
  executed: Object.freeze(["verified", "failed", "rolled_back"]),
  verified: Object.freeze(["rolled_back"]),
  failed: Object.freeze(["queued", "rolled_back"]),
  rolled_back: Object.freeze([]),
});

function isValidExecutionStatus(status) {
  return EXECUTION_LIFECYCLE_STATUSES.includes(status);
}

function assertExecutionStatus(status, label = "status") {
  if (!isValidExecutionStatus(status)) {
    throw new Error(`invalid_${label}`);
  }
}

function assertRecommendationTransition(currentStatus, nextStatus) {
  const allowedTransitions = RECOMMENDATION_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowedTransitions.includes(nextStatus)) {
    throw new Error("invalid_recommendation_status_transition");
  }
}

function assertTaskTransition(currentStatus, nextStatus) {
  const allowedTransitions = TASK_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowedTransitions.includes(nextStatus)) {
    throw new Error("invalid_task_status_transition");
  }
}

module.exports = {
  EXECUTION_LIFECYCLE_STATUSES,
  RECOMMENDATION_STATUSES,
  RECOMMENDATION_STATUS_TRANSITIONS,
  TASK_STATUSES,
  TASK_STATUS_TRANSITIONS,
  assertRecommendationTransition,
  assertTaskTransition,
  assertExecutionStatus,
  isValidExecutionStatus,
};
