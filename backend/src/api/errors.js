class ApiError extends Error {
  constructor(code, message, statusCode = 400, details = null) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

function createApiError(code, message, statusCode = 400, details = null) {
  return new ApiError(code, message, statusCode, details);
}

// Explicit registry: every known error code maps to its HTTP status.
// Look up here first; fall back to pattern matching only for dynamic codes (governance_blocks_*).
const ERROR_REGISTRY = {
  // 400 — validation
  invalid_json: 400,
  invalid_request_body: 400,
  invalid_module_input: 400,
  invalid_request_context: 400,
  invalid_module_inputs: 400,
  invalid_activation_overrides: 400,
  invalid_request_options: 400,
  invalid_source_module_key: 400,
  invalid_recommendation_title: 400,
  invalid_recommendation_summary: 400,
  invalid_recommendation_action_type: 400,
  invalid_recommendation_payload: 400,
  invalid_recommendation_target: 400,
  invalid_recommendation_score: 400,
  invalid_recommendation_next_status: 400,
  invalid_recommendation_status: 400,
  invalid_task_next_status: 400,
  invalid_task_status: 400,
  invalid_rollback_metadata: 400,
  invalid_task_metadata: 400,
  missing_required_input: 400,
  // 401 — auth
  missing_actor_identity: 401,
  auth_required: 401,
  // 404 — not found
  recommendation_not_found: 404,
  task_not_found: 404,
  module_not_found: 404,
  attribution_not_found: 404,
  not_found: 404,
  // 405 — method
  method_not_allowed: 405,
  // 409 — conflict
  task_already_exists_for_recommendation: 409,
  // 413 — payload
  payload_too_large: 413,
  // 429 — rate limit
  rate_limit_exceeded: 429,
  // 500 — server
  measurement_query_not_configured: 500,
  business_intelligence_query_not_configured: 500,
  execution_audit_repository_not_configured: 500,
  execution_query_not_configured: 500,
  internal_server_error: 500,
  // 503 — upstream
  auth_service_unavailable: 503,
  module_timeout: 503,
};

function normalizeError(error) {
  if (error instanceof ApiError) {
    return error;
  }

  const message = error?.message || "internal_server_error";

  // Registry lookup — exact match takes priority.
  if (Object.prototype.hasOwnProperty.call(ERROR_REGISTRY, message)) {
    return createApiError(message, "Request could not be completed.", ERROR_REGISTRY[message]);
  }

  // Dynamic-prefix patterns that cannot be enumerated in the registry.
  if (message.startsWith("governance_blocks_")) {
    return createApiError(message, "Request conflicts with current resource state.", 409);
  }
  if (message.endsWith("_requires_approval") || message.endsWith("_status_transition")) {
    return createApiError(message, "Request conflicts with current resource state.", 409);
  }

  // Unknown code — log a warning so it gets added to the registry.
  console.log(JSON.stringify({ kind: "unknown_error_code", code: message, note: "Add to ERROR_REGISTRY in errors.js" }));
  return createApiError("internal_server_error", "An internal server error occurred.", 500);
}

module.exports = {
  ApiError,
  ERROR_REGISTRY,
  createApiError,
  normalizeError,
};
