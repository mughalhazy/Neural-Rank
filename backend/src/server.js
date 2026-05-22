const http = require("node:http");
const { URL } = require("node:url");
const { createHash } = require("node:crypto");
const { initDb, probeDb, getPoolStats } = require("./db");
const { increment, observe, getMetricsText } = require("./core/metrics");
const { reportError } = require("./core/errorReporter");

const {
  getDefaultActivationState,
  getRegisteredModuleKeys,
  getModuleService,
  listModulesByActivation,
  moduleCatalog,
  runActivationAwareFlow,
  runDefaultBackendFlow,
} = require("./index");
const { createContainer } = require("./container");
const { normalizeError } = require("./api/errors");
const { SPEC_JSON, SWAGGER_UI_HTML } = require("./api/openapi");
const { resolveRequestIdentity, requireIdentity } = require("./api/auth");
const {
  applyPagination,
  parseFilterParams,
  parsePaginationParams,
  validateFlowRunBody,
  validateModuleInput,
  validateModuleRunBody,
  validateRecommendationCreateBody,
  validateRecommendationStatusBody,
  validateTaskCreateBody,
  validateTaskStatusBody,
} = require("./api/validation");
const {
  DEFAULT_LIMIT,
  MUTATION_LIMIT,
  checkLimit,
  getIpKey,
  getActorKey,
} = require("./core/rateLimiter");

// ── Response helpers ──────────────────────────────────────────────────────────

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

function addSecurityHeaders(headers) {
  headers["X-Content-Type-Options"] = "nosniff";
  headers["X-Frame-Options"] = "DENY";
  headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
  headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";
  headers["X-XSS-Protection"] = "0";
  headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()";
  headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN;
  headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Neural-Rank-Actor, X-Neural-Rank-Client-Id, X-Neural-Rank-Workspace-Id, X-Request-ID";
  headers["Access-Control-Max-Age"] = "86400";
  return headers;
}

function sendEnvelope(response, statusCode, { ok, data = null, error = null, meta = {} }, rateLimitInfo = null) {
  const body = JSON.stringify({ ok, data, error, meta }, null, 2);
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  };

  addSecurityHeaders(headers);

  if (rateLimitInfo) {
    headers["X-RateLimit-Limit"] = String(rateLimitInfo.limit);
    headers["X-RateLimit-Remaining"] = String(rateLimitInfo.remaining);
    headers["X-RateLimit-Reset"] = String(Math.ceil(rateLimitInfo.resetAt / 1000));
    headers["X-RateLimit-Policy"] = `${rateLimitInfo.limit};w=60`;
    headers["X-RateLimit-Enforced"] = "true";
  } else {
    headers["X-RateLimit-Policy"] = "unenforced";
    headers["X-RateLimit-Enforced"] = "false";
  }

  response.writeHead(statusCode, headers);
  response.end(body);
}

function sendMethodNotAllowed(response, allowedMethods) {
  response.writeHead(405, {
    Allow: allowedMethods.join(", "),
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(
    JSON.stringify({
      ok: false,
      data: null,
      error: { code: "method_not_allowed", message: "HTTP method is not allowed for this route." },
      meta: {},
    }),
  );
}

function sendTooManyRequests(response, rateLimitInfo) {
  sendEnvelope(
    response,
    429,
    {
      ok: false,
      error: {
        code: "rate_limit_exceeded",
        message: `Rate limit of ${rateLimitInfo.limit} requests/minute exceeded. Retry after ${Math.ceil((rateLimitInfo.resetAt - Date.now()) / 1000)}s.`,
      },
    },
    rateLimitInfo,
  );
}

// ── ETag helpers ─────────────────────────────────────────────────────────────

function computeETag(data) {
  return `"${createHash("sha256").update(JSON.stringify(data)).digest("hex").slice(0, 16)}"`;
}

function sendWithETag(response, statusCode, envelope, rateLimitInfo, items) {
  const etag = computeETag(items);
  response.setHeader("ETag", etag);
  response.setHeader("Cache-Control", "private, max-age=0, must-revalidate");
  sendEnvelope(response, statusCode, envelope, rateLimitInfo);
}

function checkIfNoneMatch(request, items) {
  const clientETag = request.headers["if-none-match"];
  if (!clientETag) return false;
  return clientETag === computeETag(items);
}

// ── Request parsing ───────────────────────────────────────────────────────────

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let oversized = false;
    request.on("data", (chunk) => {
      if (oversized) return;
      body += chunk;
      if (body.length > 1024 * 1024) {
        oversized = true;
        reject(new Error("payload_too_large"));
        // Pause reading but do NOT destroy the socket — allows the 413 response to be sent.
        request.pause();
      }
    });
    request.on("end", () => {
      if (oversized) return;
      if (!body.trim()) { resolve({}); return; }
      try { resolve(JSON.parse(body)); } catch { reject(new Error("invalid_json")); }
    });
    request.on("error", reject);
  });
}

// ── Rate limiting helper ──────────────────────────────────────────────────────

function applyRateLimit(request, response, { actor = null, isMutation = false } = {}) {
  const ipKey = getIpKey(request);
  const ipResult = checkLimit(ipKey, DEFAULT_LIMIT);

  if (!ipResult.allowed) {
    sendTooManyRequests(response, ipResult);
    return false;
  }

  if (isMutation && actor) {
    const actorResult = checkLimit(getActorKey(actor), MUTATION_LIMIT);
    if (!actorResult.allowed) {
      sendTooManyRequests(response, actorResult);
      return false;
    }
  }

  return ipResult;
}

// ── Health & info payloads ────────────────────────────────────────────────────

async function buildHealthPayload() {
  const activationState = getDefaultActivationState();
  const grouped = listModulesByActivation();
  const db = await probeDb();
  const poolStats = getPoolStats();
  const deployable = db.status !== "fail";
  return {
    status: deployable ? "ok" : "degraded",
    service: "neural-rank-backend",
    deployable,
    checks: { http: "pass", db: db.status },
    activeModuleCount: grouped.active.length,
    activeModules: grouped.active,
    inactiveModules: grouped.inactive,
    activationState,
    pool: poolStats,
  };
}

function buildReadinessPayload() {
  return {
    status: "ready",
    service: "neural-rank-backend",
    checks: { http: "pass", executionLifecycle: "pass", governance: "pass" },
  };
}

function buildModulesPayload() {
  return {
    modules: moduleCatalog.map((m) => ({
      moduleKey: m.moduleKey,
      displayName: m.displayName,
      defaultActive: m.defaultActive,
      initialState: m.initialState,
    })),
  };
}

// ── Module run handlers ───────────────────────────────────────────────────────

async function handleDefaultRun(request, response) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const body = await readJsonBody(request);
  validateFlowRunBody(body);
  const result = await runDefaultBackendFlow(body.moduleInputs || {}, body.context || {});
  sendEnvelope(response, 200, { ok: true, data: result, meta: {} }, rl);
}

async function handleActivationAwareRun(request, response) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const body = await readJsonBody(request);
  validateFlowRunBody(body);
  const result = await runActivationAwareFlow(
    body.moduleInputs || {},
    body.context || {},
    body.activationOverrides || {},
    body.options || {},
  );
  sendEnvelope(response, 200, { ok: true, data: result, meta: {} }, rl);
}

async function handleSingleModuleRun(request, response, pathname) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;

  const match = pathname.match(/^\/modules\/([^/]+)\/run$/);
  const moduleKey = match ? decodeURIComponent(match[1]) : null;
  const service = moduleKey ? getModuleService(moduleKey) : null;

  if (!moduleKey || !service || typeof service.run !== "function") {
    sendEnvelope(response, 404, { ok: false, error: { code: "module_not_found", message: "Requested module was not found." }, meta: { moduleKey } }, rl);
    return;
  }

  const body = await readJsonBody(request);
  validateModuleRunBody(body);
  validateModuleInput(moduleKey, body.moduleInput || {});
  const result = await service.run(body.moduleInput || {}, body.context || {});
  sendEnvelope(response, 200, { ok: true, data: result, meta: { moduleKey } }, rl);
}

// ── Execution lifecycle handlers ──────────────────────────────────────────────

function buildExecutionPayloadList(items = [], key) {
  return { [key]: items, count: items.length };
}

const SAFE_BODY_CONTEXT_KEYS = ["workspaceId", "clientId", "targetRef", "websiteUrl", "appId"];

function buildRequestContext(baseContext = {}, bodyContext = {}, identity = {}) {
  const safeBodyContext = {};
  for (const key of SAFE_BODY_CONTEXT_KEYS) {
    if (Object.prototype.hasOwnProperty.call(bodyContext, key)) {
      safeBodyContext[key] = bodyContext[key];
    }
  }
  return {
    ...baseContext,
    ...safeBodyContext,
    requestIdentity: identity,
    workspaceId: identity.workspaceId || safeBodyContext.workspaceId || null,
  };
}

async function handleExecutionRecommendations(request, response, baseContext, identity, executionService) {
  const rl = applyRateLimit(request, response);
  if (!rl) return;

  if (request.method === "GET") {
    const url = new URL(request.url, "http://127.0.0.1");
    const pagination = parsePaginationParams(url);
    const filters = parseFilterParams(url, ["status", "sourceModuleKey"]);
    const all = await executionService.listRecommendations(baseContext);
    const filtered = all.filter((r) => {
      if (filters.status && r.currentStatus !== filters.status) return false;
      if (filters.sourceModuleKey && r.sourceModuleKey !== filters.sourceModuleKey) return false;
      return true;
    });
    const { items, count, nextCursor } = applyPagination(filtered, pagination);
    if (checkIfNoneMatch(request, items)) { response.writeHead(304); response.end(); return; }
    sendWithETag(response, 200, { ok: true, data: { recommendations: items, count, nextCursor }, meta: {} }, rl, items);
    return;
  }

  if (request.method === "POST") {
    requireIdentity(identity);
    const body = await readJsonBody(request);
    validateRecommendationCreateBody(body.recommendation || body);
    const mutRl = applyRateLimit(request, response, { actor: identity.actor, isMutation: true });
    if (!mutRl) return;
    const recommendation = await executionService.createRecommendation(
      body.recommendation || body,
      buildRequestContext(baseContext, body.context || {}, identity),
    );
    sendEnvelope(response, 201, {
      ok: true,
      data: recommendation,
      meta: { actor: identity.actor, auditable: true, clientId: identity.clientId, workspaceId: identity.workspaceId },
    }, mutRl);
    return;
  }

  sendMethodNotAllowed(response, ["GET", "POST"]);
}

async function handleExecutionRecommendationStatus(request, response, pathname, baseContext, identity, executionService) {
  if (request.method !== "PATCH") { sendMethodNotAllowed(response, ["PATCH"]); return; }
  requireIdentity(identity);
  const rl = applyRateLimit(request, response, { actor: identity.actor, isMutation: true });
  if (!rl) return;

  const match = pathname.match(/^\/execution\/recommendations\/([^/]+)\/status$/);
  const recommendationId = match ? decodeURIComponent(match[1]) : null;
  if (!recommendationId) {
    sendEnvelope(response, 404, { ok: false, error: { code: "recommendation_not_found", message: "Recommendation was not found." }, meta: {} }, rl);
    return;
  }

  const body = await readJsonBody(request);
  validateRecommendationStatusBody(body);
  const updated = await executionService.updateRecommendationStatus(
    recommendationId, body, buildRequestContext(baseContext, body.context || {}, identity),
  );
  sendEnvelope(response, 200, {
    ok: true, data: updated,
    meta: { actor: identity.actor, auditable: true, clientId: identity.clientId, workspaceId: identity.workspaceId },
  }, rl);
}

async function handleExecutionRecommendationTaskCreation(request, response, pathname, baseContext, identity, executionService) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  requireIdentity(identity);
  const rl = applyRateLimit(request, response, { actor: identity.actor, isMutation: true });
  if (!rl) return;

  const match = pathname.match(/^\/execution\/recommendations\/([^/]+)\/tasks$/);
  const recommendationId = match ? decodeURIComponent(match[1]) : null;
  if (!recommendationId) {
    sendEnvelope(response, 404, { ok: false, error: { code: "recommendation_not_found", message: "Recommendation was not found." }, meta: {} }, rl);
    return;
  }

  const body = await readJsonBody(request);
  validateTaskCreateBody(body);
  const task = await executionService.createTaskFromRecommendation(
    recommendationId, body, buildRequestContext(baseContext, body.context || {}, identity),
  );
  sendEnvelope(response, 201, {
    ok: true, data: task,
    meta: { actor: identity.actor, auditable: true, clientId: identity.clientId, workspaceId: identity.workspaceId },
  }, rl);
}

async function handleExecutionTasks(request, response, baseContext, executionService) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const url = new URL(request.url, "http://127.0.0.1");
  const pagination = parsePaginationParams(url);
  const filters = parseFilterParams(url, ["status"]);
  const all = await executionService.listTasks(baseContext);
  const filtered = all.filter((t) => {
    if (filters.status && t.currentStatus !== filters.status) return false;
    return true;
  });
  const { items, count, nextCursor } = applyPagination(filtered, pagination);
  if (checkIfNoneMatch(request, items)) { response.writeHead(304); response.end(); return; }
  sendWithETag(response, 200, { ok: true, data: { tasks: items, count, nextCursor }, meta: {} }, rl, items);
}

async function handleExecutionTask(request, response, pathname, baseContext, executionService) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const match = pathname.match(/^\/execution\/tasks\/([^/]+)$/);
  const taskId = match ? decodeURIComponent(match[1]) : null;
  const task = taskId ? await executionService.getTask(taskId, baseContext) : null;
  if (!task) {
    sendEnvelope(response, 404, { ok: false, error: { code: "task_not_found", message: "Task was not found." }, meta: {} }, rl);
    return;
  }
  sendEnvelope(response, 200, { ok: true, data: task, meta: {} }, rl);
}

async function handleExecutionTaskStatus(request, response, pathname, baseContext, identity, executionService) {
  if (request.method !== "PATCH") { sendMethodNotAllowed(response, ["PATCH"]); return; }
  requireIdentity(identity);
  const rl = applyRateLimit(request, response, { actor: identity.actor, isMutation: true });
  if (!rl) return;

  const match = pathname.match(/^\/execution\/tasks\/([^/]+)\/status$/);
  const taskId = match ? decodeURIComponent(match[1]) : null;
  if (!taskId) {
    sendEnvelope(response, 404, { ok: false, error: { code: "task_not_found", message: "Task was not found." }, meta: {} }, rl);
    return;
  }

  const body = await readJsonBody(request);
  validateTaskStatusBody(body);
  const updated = await executionService.updateTaskStatus(
    taskId, body, buildRequestContext(baseContext, body.context || {}, identity),
  );
  sendEnvelope(response, 200, {
    ok: true, data: updated,
    meta: { actor: identity.actor, auditable: true, clientId: identity.clientId, workspaceId: identity.workspaceId },
  }, rl);
}

async function handleExecutionTaskHistory(request, response, pathname, baseContext, executionService) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const match = pathname.match(/^\/execution\/tasks\/([^/]+)\/history$/);
  const taskId = match ? decodeURIComponent(match[1]) : null;
  if (!taskId) {
    sendEnvelope(response, 404, { ok: false, error: { code: "task_not_found", message: "Task was not found." }, meta: {} }, rl);
    return;
  }
  const history = await executionService.listTaskStatusHistory(taskId, baseContext);
  sendEnvelope(response, 200, { ok: true, data: buildExecutionPayloadList(history, "history"), meta: {} }, rl);
}

async function handleExecutionAuditLogs(request, response, baseContext, executionService) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const url = new URL(request.url, "http://127.0.0.1");
  const pagination = parsePaginationParams(url);
  const filters = parseFilterParams(url, ["entityType", "from"]);
  const all = await executionService.listAuditLogs(baseContext);
  const filtered = all.filter((log) => {
    if (filters.entityType && log.entityType !== filters.entityType) return false;
    if (filters.from && log.createdAt < filters.from) return false;
    return true;
  });
  const { items, count, nextCursor } = applyPagination(filtered, pagination);
  if (checkIfNoneMatch(request, items)) { response.writeHead(304); response.end(); return; }
  sendWithETag(response, 200, { ok: true, data: { auditLogs: items, count, nextCursor }, meta: {} }, rl, items);
}

// ── Measurement domain handlers ───────────────────────────────────────────────

async function handleMeasurementMetrics(request, response, measurementService) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const sources = await measurementService.listMetricSources();
  sendEnvelope(response, 200, { ok: true, data: { metrics: sources, count: sources.length }, meta: {} }, rl);
}

async function handleMeasurementSnapshots(request, response, identity, measurementService) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  requireIdentity(identity);
  const rl = applyRateLimit(request, response, { actor: identity.actor, isMutation: true });
  if (!rl) return;
  const body = await readJsonBody(request);
  const kind = body.snapshotKind || body.kind || "baseline";
  const result = kind === "post_change"
    ? await measurementService.recordPostChangeSnapshot(body)
    : await measurementService.recordBaselineSnapshot(body);
  sendEnvelope(response, 201, { ok: true, data: result, meta: { snapshotKind: kind } }, rl);
}

async function handleMeasurementAttributions(request, response, pathname, identity, measurementService) {
  const rl = applyRateLimit(request, response);
  if (!rl) return;

  if (request.method === "POST" && pathname === "/measurement/attributions") {
    requireIdentity(identity);
    const mutRl = applyRateLimit(request, response, { actor: identity.actor, isMutation: true });
    if (!mutRl) return;
    const body = await readJsonBody(request);
    const result = await measurementService.recordAttributionLink(body);
    sendEnvelope(response, 201, { ok: true, data: result, meta: {} }, mutRl);
    return;
  }

  if (request.method === "GET") {
    const match = pathname.match(/^\/measurement\/attributions\/([^/]+)$/);
    const attributionId = match ? decodeURIComponent(match[1]) : null;
    if (!attributionId) {
      sendEnvelope(response, 404, { ok: false, error: { code: "attribution_not_found", message: "Attribution was not found." }, meta: {} }, rl);
      return;
    }
    const summary = await measurementService.getMeasurementSummary(attributionId);
    sendEnvelope(response, 200, { ok: true, data: summary, meta: {} }, rl);
    return;
  }

  sendMethodNotAllowed(response, ["GET", "POST"]);
}

// ── Technical operations domain handlers ─────────────────────────────────────

async function handleTechnicalOperationsAudit(request, response, identity, technicalOperationsService) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  requireIdentity(identity);
  const rl = applyRateLimit(request, response, { actor: identity.actor, isMutation: true });
  if (!rl) return;
  const body = await readJsonBody(request);
  const result = await technicalOperationsService.auditTechnicalSeo(body);
  sendEnvelope(response, 200, { ok: true, data: result, meta: {} }, rl);
}

// ── Search intelligence domain handlers ──────────────────────────────────────

async function handleSearchIntelligenceClassify(request, response, identity, searchIntelligenceService) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  requireIdentity(identity);
  const rl = applyRateLimit(request, response, { actor: identity.actor, isMutation: true });
  if (!rl) return;
  const body = await readJsonBody(request);
  const result = await searchIntelligenceService.classifyIntent(body);
  sendEnvelope(response, 200, { ok: true, data: result, meta: {} }, rl);
}

async function handleSearchIntelligenceAnalyze(request, response, baseContext, identity, searchIntelligenceService) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  requireIdentity(identity);
  const rl = applyRateLimit(request, response, { actor: identity.actor, isMutation: true });
  if (!rl) return;
  const body = await readJsonBody(request);
  const result = await searchIntelligenceService.analyzeQuery(body, { ...baseContext, ...body.context });
  sendEnvelope(response, 200, { ok: true, data: result, meta: {} }, rl);
}

// ── Business intelligence domain handlers ────────────────────────────────────

async function handleBusinessIntelligenceProfiles(request, response, identity, businessIntelligenceService) {
  const rl = applyRateLimit(request, response);
  if (!rl) return;

  if (request.method === "GET") {
    const profiles = await businessIntelligenceService.listBusinessProfiles();
    sendEnvelope(response, 200, { ok: true, data: { profiles, count: profiles.length }, meta: {} }, rl);
    return;
  }

  if (request.method === "POST") {
    requireIdentity(identity);
    const mutRl = applyRateLimit(request, response, { actor: identity.actor, isMutation: true });
    if (!mutRl) return;
    const body = await readJsonBody(request);
    const result = await businessIntelligenceService.createBusinessProfile(body);
    sendEnvelope(response, 201, { ok: true, data: result, meta: {} }, mutRl);
    return;
  }

  sendMethodNotAllowed(response, ["GET", "POST"]);
}

// ── System & diagnostic route handlers ───────────────────────────────────────

async function handleHealth(request, response) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const healthData = await buildHealthPayload();
  sendEnvelope(response, healthData.deployable ? 200 : 503, { ok: healthData.deployable, data: healthData, meta: {} }, rl);
}

function handleReady(request, response) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  sendEnvelope(response, 200, { ok: true, data: buildReadinessPayload(), meta: {} });
}

function handleModules(request, response) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  sendEnvelope(response, 200, { ok: true, data: buildModulesPayload(), meta: {} });
}

function handleOpenApiSpec(request, response) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const headers = { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(SPEC_JSON) };
  addSecurityHeaders(headers);
  response.writeHead(200, headers);
  response.end(SPEC_JSON);
}

function handleSwaggerDocs(request, response) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const headers = { "Content-Type": "text/html; charset=utf-8", "Content-Length": Buffer.byteLength(SWAGGER_UI_HTML) };
  addSecurityHeaders(headers);
  response.writeHead(200, headers);
  response.end(SWAGGER_UI_HTML);
}

function handlePrometheusMetrics(request, response) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const metricsBody = getMetricsText();
  const headers = { "Content-Type": "text/plain; version=0.0.4; charset=utf-8", "Content-Length": Buffer.byteLength(metricsBody) };
  addSecurityHeaders(headers);
  response.writeHead(200, headers);
  response.end(metricsBody);
}

// ── Logging ───────────────────────────────────────────────────────────────────

function logRequestEvent(kind, payload = {}) {
  const sanitized = { ...payload };
  if (sanitized.headers) {
    delete sanitized.headers.authorization;
    delete sanitized.headers["x-service-key"];
    delete sanitized.headers["x-api-key"];
  }
  console.log(JSON.stringify({ kind, ...sanitized }));
}

// ── Per-request helpers ───────────────────────────────────────────────────────

function attachRequestTelemetry(request, response, rawPathname, startedAt, correlationId) {
  response.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    logRequestEvent("request", { method: request.method, path: rawPathname, status: response.statusCode, durationMs, correlationId });
    const routeLabel = rawPathname.replace(/\/[0-9a-f-]{36}/gi, "/:id").replace(/^\/v1/, "/v1");
    increment("http_request_total", { route: routeLabel, method: request.method, status: String(response.statusCode) });
    observe("http_request_duration_ms", durationMs, { route: routeLabel });
    if (response.statusCode >= 500) increment("http_error_total", { route: routeLabel, status: String(response.statusCode) });
    if (response.statusCode === 429) increment("rate_limit_hit_total", { route: routeLabel });
  });
}

function handleRequestError(error, request, rawPathname, response) {
  const normalizedError = normalizeError(error);
  logRequestEvent("api_error", { method: request.method, path: rawPathname, code: normalizedError.code, statusCode: normalizedError.statusCode, headers: request.headers });
  if (normalizedError.statusCode >= 500) reportError(error, { tags: { route: rawPathname, method: request.method } });
  sendEnvelope(response, normalizedError.statusCode, {
    ok: false,
    error: { code: normalizedError.code, message: normalizedError.message },
    meta: { details: normalizedError.details },
  });
}

// ── Route map & dispatcher ────────────────────────────────────────────────────

const ROUTE_MAP = [
  { path: "/health",                    handler: (req, res) => handleHealth(req, res) },
  { path: "/ready",                     handler: (req, res) => handleReady(req, res) },
  { path: "/modules",                   handler: (req, res) => handleModules(req, res) },
  { path: "/run/default",               handler: (req, res) => handleDefaultRun(req, res) },
  { path: "/run/activation-aware",      handler: (req, res) => handleActivationAwareRun(req, res) },
  { pattern: /^\/modules\/[^/]+\/run$/, handler: (req, res, { pathname }) => handleSingleModuleRun(req, res, pathname) },

  { path: "/execution/recommendations",
    handler: (req, res, { baseContext, identity, container }) => handleExecutionRecommendations(req, res, baseContext, identity, container.executionService) },
  { pattern: /^\/execution\/recommendations\/[^/]+\/status$/,
    handler: (req, res, { pathname, baseContext, identity, container }) => handleExecutionRecommendationStatus(req, res, pathname, baseContext, identity, container.executionService) },
  { pattern: /^\/execution\/recommendations\/[^/]+\/tasks$/,
    handler: (req, res, { pathname, baseContext, identity, container }) => handleExecutionRecommendationTaskCreation(req, res, pathname, baseContext, identity, container.executionService) },
  { path: "/execution/tasks",
    handler: (req, res, { baseContext, container }) => handleExecutionTasks(req, res, baseContext, container.executionService) },
  { pattern: /^\/execution\/tasks\/[^/]+\/history$/,
    handler: (req, res, { pathname, baseContext, container }) => handleExecutionTaskHistory(req, res, pathname, baseContext, container.executionService) },
  { pattern: /^\/execution\/tasks\/[^/]+\/status$/,
    handler: (req, res, { pathname, baseContext, identity, container }) => handleExecutionTaskStatus(req, res, pathname, baseContext, identity, container.executionService) },
  { pattern: /^\/execution\/tasks\/[^/]+$/,
    handler: (req, res, { pathname, baseContext, container }) => handleExecutionTask(req, res, pathname, baseContext, container.executionService) },
  { path: "/execution/audit-logs",
    handler: (req, res, { baseContext, container }) => handleExecutionAuditLogs(req, res, baseContext, container.executionService) },

  { path: "/measurement/metrics",
    handler: (req, res, { container }) => handleMeasurementMetrics(req, res, container.measurementService) },
  { path: "/measurement/snapshots",
    handler: (req, res, { identity, container }) => handleMeasurementSnapshots(req, res, identity, container.measurementService) },
  { path: "/measurement/attributions",
    handler: (req, res, { pathname, identity, container }) => handleMeasurementAttributions(req, res, pathname, identity, container.measurementService) },
  { pattern: /^\/measurement\/attributions\/[^/]+$/,
    handler: (req, res, { pathname, identity, container }) => handleMeasurementAttributions(req, res, pathname, identity, container.measurementService) },

  { path: "/technical-operations/audit",
    handler: (req, res, { identity, container }) => handleTechnicalOperationsAudit(req, res, identity, container.technicalOperationsService) },
  { path: "/search-intelligence/classify",
    handler: (req, res, { identity, container }) => handleSearchIntelligenceClassify(req, res, identity, container.searchIntelligenceService) },
  { path: "/search-intelligence/analyze",
    handler: (req, res, { baseContext, identity, container }) => handleSearchIntelligenceAnalyze(req, res, baseContext, identity, container.searchIntelligenceService) },
  { path: "/business-intelligence/profiles",
    handler: (req, res, { identity, container }) => handleBusinessIntelligenceProfiles(req, res, identity, container.businessIntelligenceService) },

  { path: "/openapi.json", handler: (req, res) => handleOpenApiSpec(req, res) },
  { path: "/docs",         handler: (req, res) => handleSwaggerDocs(req, res) },
  { path: "/metrics",      handler: (req, res) => handlePrometheusMetrics(req, res) },
];

function dispatch(pathname, req, res, ctx) {
  for (const { path, pattern, handler } of ROUTE_MAP) {
    if ((path !== undefined && path === pathname) || (pattern !== undefined && pattern.test(pathname))) {
      return handler(req, res, ctx);
    }
  }
  return null;
}

// ── Main request handler ──────────────────────────────────────────────────────

const AVAILABLE_ROUTES = [
  "GET /v1/health",
  "GET /v1/ready",
  "GET /v1/modules",
  "POST /v1/run/default",
  "POST /v1/run/activation-aware",
  "POST /v1/modules/:moduleKey/run",
  "GET /v1/execution/recommendations",
  "POST /v1/execution/recommendations",
  "PATCH /v1/execution/recommendations/:recommendationId/status",
  "POST /v1/execution/recommendations/:recommendationId/tasks",
  "GET /v1/execution/tasks",
  "GET /v1/execution/tasks/:taskId",
  "PATCH /v1/execution/tasks/:taskId/status",
  "GET /v1/execution/tasks/:taskId/history",
  "GET /v1/execution/audit-logs",
  "GET /v1/measurement/metrics",
  "POST /v1/measurement/snapshots",
  "POST /v1/measurement/attributions",
  "GET /v1/measurement/attributions/:attributionId",
  "POST /v1/technical-operations/audit",
  "POST /v1/search-intelligence/classify",
  "POST /v1/search-intelligence/analyze",
  "GET /v1/business-intelligence/profiles",
  "POST /v1/business-intelligence/profiles",
  "GET /v1/openapi.json",
  "GET /v1/docs",
  "GET /v1/metrics",
];

function createRequestHandler(container) {
  const baseContext = container.baseContext || {};
  return async function requestHandler(request, response) {
    const url = new URL(request.url, "http://127.0.0.1");
    const rawPathname = url.pathname;
    const startedAt = Date.now();
    const correlationId = request.headers["x-request-id"] || require("node:crypto").randomUUID();
    response.setHeader("X-Request-ID", correlationId);
    attachRequestTelemetry(request, response, rawPathname, startedAt, correlationId);

    try {
      if (request.method === "OPTIONS") {
        const headers = {};
        addSecurityHeaders(headers);
        response.writeHead(204, headers);
        response.end();
        return;
      }

      if (!rawPathname.startsWith("/v1")) {
        const target = `/v1${rawPathname}${url.search}`;
        const headers = { Location: target, Deprecation: "true" };
        addSecurityHeaders(headers);
        response.writeHead(301, headers);
        response.end();
        return;
      }

      const pathname = rawPathname.slice(3) || "/";
      const identity = await resolveRequestIdentity(request);
      const pending = dispatch(pathname, request, response, { baseContext, identity, pathname, container });
      if (pending === null) {
        sendEnvelope(response, 404, {
          ok: false,
          error: { code: "not_found", message: "Route was not found." },
          meta: { availableRoutes: AVAILABLE_ROUTES, registeredModules: getRegisteredModuleKeys() },
        });
        return;
      }
      await pending;
    } catch (error) {
      handleRequestError(error, request, rawPathname, response);
    }
  };
}

function createServer({ container } = {}) {
  const c = container || createContainer();
  return http.createServer(createRequestHandler(c));
}

async function startServer({ port = Number(process.env.PORT) || 10000, host = "0.0.0.0" } = {}) {
  const dbPool = await initDb();
  const query = dbPool ? (sql, params) => dbPool.query(sql, params) : null;
  const container = createContainer({ query });

  return new Promise((resolve, reject) => {
    const server = createServer({ container });
    server.once("error", reject);
    server.listen(port, host, () => {
      server.removeListener("error", reject);
      resolve(server);
    });
  });
}

module.exports = {
  AVAILABLE_ROUTES,
  buildHealthPayload,
  buildReadinessPayload,
  buildModulesPayload,
  createRequestHandler,
  createServer,
  startServer,
};

process.on('unhandledRejection', (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  reportError(err, { tags: { kind: 'unhandled_rejection' } });
  console.log(JSON.stringify({ kind: 'unhandled_rejection', reason: String(reason) }));
});
process.on('uncaughtException', (error) => {
  reportError(error, { tags: { kind: 'uncaught_exception' } });
  console.log(JSON.stringify({ kind: 'uncaught_exception', reason: String(error) }));
  process.exit(1);
});

if (require.main === module) {
  startServer()
    .then((server) => {
      const address = server.address();
      const resolvedPort = address && typeof address === "object" ? address.port : process.env.PORT || 10000;
      console.log(`neural-rank-backend listening on 0.0.0.0:${resolvedPort}`);
    })
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exit(1);
    });
}
