const { createApiError } = require("./errors");
const { MODULE_INPUT_REQUIREMENTS } = require("../core/moduleInputRequirements");

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

function assertStringMaxLength(value, maxLen, code, label) {
  if (typeof value === "string" && value.length > maxLen) {
    throw createApiError(code, `${label} must be ${maxLen} characters or fewer.`, 400);
  }
}

// ── Pagination helpers ────────────────────────────────────────────────────────

const ALLOWED_SORTS = ["createdAt", "updatedAt", "priority"];
const ALLOWED_ORDERS = ["asc", "desc"];
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function parsePaginationParams(url) {
  const params = url.searchParams;
  let limit = DEFAULT_LIMIT;
  if (params.has("limit")) {
    const raw = parseInt(params.get("limit"), 10);
    if (!Number.isInteger(raw) || raw < 1 || raw > MAX_LIMIT) {
      throw createApiError("invalid_pagination_limit", `limit must be an integer between 1 and ${MAX_LIMIT}.`, 400);
    }
    limit = raw;
  }
  const cursor = params.has("cursor") ? String(params.get("cursor")) : null;
  const sort = params.has("sort") ? String(params.get("sort")) : "createdAt";
  if (!ALLOWED_SORTS.includes(sort)) {
    throw createApiError("invalid_pagination_sort", `sort must be one of: ${ALLOWED_SORTS.join(", ")}.`, 400);
  }
  const order = params.has("order") ? String(params.get("order")) : "desc";
  if (!ALLOWED_ORDERS.includes(order)) {
    throw createApiError("invalid_pagination_order", `order must be 'asc' or 'desc'.`, 400);
  }
  return { limit, cursor, sort, order };
}

function parseFilterParams(url, allowedFilters = []) {
  const params = url.searchParams;
  const filters = {};
  for (const key of allowedFilters) {
    if (params.has(key)) {
      filters[key] = String(params.get(key));
    }
  }
  return filters;
}

function applyPagination(items = [], { limit, cursor, sort, order } = {}) {
  const sortKey = sort === "priority" ? "derivedPriority" : sort === "updatedAt" ? "updatedAt" : "createdAt";

  // Sort
  const sorted = [...items].sort((a, b) => {
    const va = a[sortKey] || "";
    const vb = b[sortKey] || "";
    return order === "asc" ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
  });

  // Cursor: base64 of the last-seen item's createdAt+id
  let startIdx = 0;
  if (cursor) {
    try {
      const decoded = Buffer.from(cursor, "base64").toString("utf8");
      const { id } = JSON.parse(decoded);
      const idx = sorted.findIndex((item) => item.id === id);
      if (idx !== -1) startIdx = idx + 1;
    } catch { /* invalid cursor — ignore, start from beginning */ }
  }

  const page = sorted.slice(startIdx, startIdx + limit);
  const last = page[page.length - 1];
  const nextCursor = page.length === limit && startIdx + limit < sorted.length
    ? Buffer.from(JSON.stringify({ id: last.id, createdAt: last.createdAt })).toString("base64")
    : null;

  return { items: page, count: page.length, nextCursor };
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
  assertStringMaxLength(body.title, 500, "invalid_recommendation_title", "title");
  assertString(body.actionType, "invalid_recommendation_action_type", "actionType");
  assertStringMaxLength(body.actionType, 100, "invalid_recommendation_action_type", "actionType");
  if (body.summary !== undefined) {
    assertStringMaxLength(body.summary, 5000, "invalid_recommendation_summary", "summary");
  }
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
  assertStringMaxLength(body.nextStatus, 50, "invalid_recommendation_next_status", "nextStatus");
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
  assertStringMaxLength(body.nextStatus, 50, "invalid_task_next_status", "nextStatus");
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

  const actorTrimmed = typeof actor === "string" && actor.trim() ? actor.trim() : null;

  return {
    // Actors over 255 chars are treated as absent — header value is clearly malformed.
    actor: actorTrimmed && actorTrimmed.length <= 255 ? actorTrimmed : null,
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

function validateModuleInput(moduleKey, moduleInput = {}) {
  const requiredFields = MODULE_INPUT_REQUIREMENTS[moduleKey];
  if (!requiredFields) return; // unknown module key — let the module handle it
  const hasRequiredField = requiredFields.some((field) =>
    Object.prototype.hasOwnProperty.call(moduleInput, field) && moduleInput[field] !== undefined && moduleInput[field] !== null,
  );
  if (!hasRequiredField) {
    throw createApiError(
      "missing_required_input",
      `moduleInput must include at least one of: ${requiredFields.join(", ")}.`,
      400,
    );
  }
}

module.exports = {
  assertStringMaxLength,
  applyPagination,
  extractRequestIdentity,
  parseFilterParams,
  parsePaginationParams,
  requireMutationIdentity,
  validateFlowRunBody,
  validateModuleInput,
  validateModuleRunBody,
  validateRecommendationCreateBody,
  validateRecommendationStatusBody,
  validateTaskCreateBody,
  validateTaskStatusBody,
};
