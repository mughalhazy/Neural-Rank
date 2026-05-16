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

function normalizeError(error) {
  if (error instanceof ApiError) {
    return error;
  }

  const message = error?.message || "internal_server_error";

  if (message === "invalid_json") {
    return createApiError("invalid_json", "Request body must be valid JSON.", 400);
  }

  if (message === "payload_too_large") {
    return createApiError("payload_too_large", "Request payload is too large.", 413);
  }

  if (message.startsWith("invalid_") || message.startsWith("unknown_")) {
    return createApiError(message, "Request validation failed.", 400);
  }

  if (message.endsWith("_not_found")) {
    return createApiError(message, "Requested resource was not found.", 404);
  }

  if (
    message.endsWith("_requires_approval") ||
    message.endsWith("_status_transition") ||
    message === "task_already_exists_for_recommendation" ||
    message.startsWith("governance_blocks_")
  ) {
    return createApiError(message, "Request conflicts with current resource state.", 409);
  }

  return createApiError("internal_server_error", "An internal server error occurred.", 500);
}

module.exports = {
  ApiError,
  createApiError,
  normalizeError,
};
