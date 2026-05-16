const { createApiError } = require("./errors");

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function assertObject(value, code, label) {
  if (!isPlainObject(value)) {
    throw createApiError(code, `${label} must be an object.`, 400);
  }
}

function assertString(value, code, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw createApiError(code, `${label} must be a non-empty string.`, 400);
  }
}

function validateModuleRunBody(body = {}) {
  assertObject(body, "invalid_request_body", "Request body");
  if (body.moduleInput !== undefined) {
    assertObject(body.moduleInput, "invalid_module_input", "moduleInput");
  }
  if (body.context !== undefined) {
    assertObject(body.context, "invalid_request_context", "context");
  }
}

function validateFlowRunBody(body = {}) {
  assertObject(body, "invalid_request_body", "Request body");
  if (body.moduleInputs !== undefined) {
    assertObject(body.moduleInputs, "invalid_module_inputs", "moduleInputs");
  }
  if (body.context !== undefined) {
    assertObject(body.context, "invalid_request_context", "context");
  }
  if (body.activationOverrides !== undefined) {
    assertObject(body.activationOverrides, "invalid_activation_overrides", "activationOverrides");
  }
  if (body.options !== undefined) {
    assertObject(body.options, "invalid_request_options", "options");
  }
}

function validateRecommendationCreateBody(body = {}) {
  assertObject(body, "invalid_request_body", "Request body");
  assertString(body.sourceModuleKey, "invalid_source_module_key", "sourceModuleKey");
  assertString(body.title, "invalid_recommendation_title", "title");
  assertString(body.actionType, "invalid_recommendation_action_type", "actionType");
  if (body.payload !== undefined) {
    assertObject(body.payload, "invalid_recommendation_payload", "payload");
  }
  if (body.target !== undefined) {
    assertObject(body.target, "invalid_recommendation_target", "target");
  }
  if (body.score !== undefined) {
    assertObject(body.score, "invalid_recommendation_score", "score");
  }
}

function validateRecommendationStatusBody(body = {}) {
  assertObject(body, "invalid_request_body", "Request body");
  assertString(body.nextStatus, "invalid_recommendation_next_status", "nextStatus");
}

function validateTaskCreateBody(body = {}) {
  assertObject(body, "invalid_request_body", "Request body");
  if (body.rollbackMetadata !== undefined) {
    assertObject(body.rollbackMetadata, "invalid_rollback_metadata", "rollbackMetadata");
  }
}

function validateTaskStatusBody(body = {}) {
  assertObject(body, "invalid_request_body", "Request body");
  assertString(body.nextStatus, "invalid_task_next_status", "nextStatus");
  if (body.metadata !== undefined) {
    assertObject(body.metadata, "invalid_task_metadata", "metadata");
  }
  if (body.rollbackMetadata !== undefined) {
    assertObject(body.rollbackMetadata, "invalid_rollback_metadata", "rollbackMetadata");
  }
}

function extractRequestIdentity(request) {
  const actor = request.headers["x-neural-rank-actor"];
  const clientId = request.headers["x-neural-rank-client-id"];
  const workspaceId = request.headers["x-neural-rank-workspace-id"];

  return {
    actor: typeof actor === "string" && actor.trim() ? actor.trim() : null,
    clientId: typeof clientId === "string" && clientId.trim() ? clientId.trim() : null,
    workspaceId: typeof workspaceId === "string" && workspaceId.trim() ? workspaceId.trim() : null,
  };
}

function requireMutationIdentity(identity) {
  if (!identity.actor) {
    throw createApiError(
      "missing_actor_identity",
      "Mutation requests require x-neural-rank-actor.",
      401,
    );
  }
}

module.exports = {
  extractRequestIdentity,
  requireMutationIdentity,
  validateFlowRunBody,
  validateModuleRunBody,
  validateRecommendationCreateBody,
  validateRecommendationStatusBody,
  validateTaskCreateBody,
  validateTaskStatusBody,
};
