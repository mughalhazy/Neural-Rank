const http = require("node:http");
const { URL } = require("node:url");
const { initDb, probeDb } = require("./db");
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
const { getExecutionService } = require("./domains/execution/service");
const { createMeasurementService } = require("./domains/measurement/service");
const { createTechnicalOperationsService } = require("./domains/technical-operations/service");
const { createSearchIntelligenceService } = require("./domains/search-intelligence/service");
const { createBusinessIntelligenceService } = require("./domains/business-intelligence/service");
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

// ── Domain service singletons ─────────────────────────────────────────────────

const measurementService = createMeasurementService();
const technicalOperationsService = createTechnicalOperationsService();
const searchIntelligenceService = createSearchIntelligenceService();
const businessIntelligenceService = createBusinessIntelligenceService();

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

async function handleExecutionRecommendations(request, response, baseContext, identity) {
  const executionService = getExecutionService();
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
    sendEnvelope(response, 200, { ok: true, data: { recommendations: items, count, nextCursor }, meta: {} }, rl);
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

async function handleExecutionRecommendationStatus(request, response, pathname, baseContext, identity) {
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
  const updated = await getExecutionService().updateRecommendationStatus(
    recommendationId, body, buildRequestContext(baseContext, body.context || {}, identity),
  );
  sendEnvelope(response, 200, {
    ok: true, data: updated,
    meta: { actor: identity.actor, auditable: true, clientId: identity.clientId, workspaceId: identity.workspaceId },
  }, rl);
}

async function handleExecutionRecommendationTaskCreation(request, response, pathname, baseContext, identity) {
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
  const task = await getExecutionService().createTaskFromRecommendation(
    recommendationId, body, buildRequestContext(baseContext, body.context || {}, identity),
  );
  sendEnvelope(response, 201, {
    ok: true, data: task,
    meta: { actor: identity.actor, auditable: true, clientId: identity.clientId, workspaceId: identity.workspaceId },
  }, rl);
}

async function handleExecutionTasks(request, response, baseContext) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const url = new URL(request.url, "http://127.0.0.1");
  const pagination = parsePaginationParams(url);
  const filters = parseFilterParams(url, ["status"]);
  const all = await getExecutionService().listTasks(baseContext);
  const filtered = all.filter((t) => {
    if (filters.status && t.currentStatus !== filters.status) return false;
    return true;
  });
  const { items, count, nextCursor } = applyPagination(filtered, pagination);
  sendEnvelope(response, 200, { ok: true, data: { tasks: items, count, nextCursor }, meta: {} }, rl);
}

async function handleExecutionTask(request, response, pathname, baseContext) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const match = pathname.match(/^\/execution\/tasks\/([^/]+)$/);
  const taskId = match ? decodeURIComponent(match[1]) : null;
  const task = taskId ? await getExecutionService().getTask(taskId, baseContext) : null;
  if (!task) {
    sendEnvelope(response, 404, { ok: false, error: { code: "task_not_found", message: "Task was not found." }, meta: {} }, rl);
    return;
  }
  sendEnvelope(response, 200, { ok: true, data: task, meta: {} }, rl);
}

async function handleExecutionTaskStatus(request, response, pathname, baseContext, identity) {
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
  const updated = await getExecutionService().updateTaskStatus(
    taskId, body, buildRequestContext(baseContext, body.context || {}, identity),
  );
  sendEnvelope(response, 200, {
    ok: true, data: updated,
    meta: { actor: identity.actor, auditable: true, clientId: identity.clientId, workspaceId: identity.workspaceId },
  }, rl);
}

async function handleExecutionTaskHistory(request, response, pathname, baseContext) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const match = pathname.match(/^\/execution\/tasks\/([^/]+)\/history$/);
  const taskId = match ? decodeURIComponent(match[1]) : null;
  if (!taskId) {
    sendEnvelope(response, 404, { ok: false, error: { code: "task_not_found", message: "Task was not found." }, meta: {} }, rl);
    return;
  }
  const history = await getExecutionService().listTaskStatusHistory(taskId, baseContext);
  sendEnvelope(response, 200, { ok: true, data: buildExecutionPayloadList(history, "history"), meta: {} }, rl);
}

async function handleExecutionAuditLogs(request, response, baseContext) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const url = new URL(request.url, "http://127.0.0.1");
  const pagination = parsePaginationParams(url);
  const filters = parseFilterParams(url, ["entityType", "from"]);
  const all = await getExecutionService().listAuditLogs(baseContext);
  const filtered = all.filter((log) => {
    if (filters.entityType && log.entityType !== filters.entityType) return false;
    if (filters.from && log.createdAt < filters.from) return false;
    return true;
  });
  const { items, count, nextCursor } = applyPagination(filtered, pagination);
  sendEnvelope(response, 200, { ok: true, data: { auditLogs: items, count, nextCursor }, meta: {} }, rl);
}

// ── Measurement domain handlers ───────────────────────────────────────────────

async function handleMeasurementMetrics(request, response) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const sources = await measurementService.listMetricSources();
  sendEnvelope(response, 200, { ok: true, data: { metrics: sources, count: sources.length }, meta: {} }, rl);
}

async function handleMeasurementSnapshots(request, response, identity) {
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

async function handleMeasurementAttributions(request, response, pathname, identity) {
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

async function handleTechnicalOperationsAudit(request, response, identity) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  requireIdentity(identity);
  const rl = applyRateLimit(request, response, { actor: identity.actor, isMutation: true });
  if (!rl) return;
  const body = await readJsonBody(request);
  const result = await technicalOperationsService.auditTechnicalSeo(body);
  sendEnvelope(response, 200, { ok: true, data: result, meta: {} }, rl);
}

// ── Search intelligence domain handlers ──────────────────────────────────────

async function handleSearchIntelligenceClassify(request, response, identity) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  requireIdentity(identity);
  const rl = applyRateLimit(request, response, { actor: identity.actor, isMutation: true });
  if (!rl) return;
  const body = await readJsonBody(request);
  const result = await searchIntelligenceService.classifyIntent(body);
  sendEnvelope(response, 200, { ok: true, data: result, meta: {} }, rl);
}

async function handleSearchIntelligenceAnalyze(request, response, baseContext, identity) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  requireIdentity(identity);
  const rl = applyRateLimit(request, response, { actor: identity.actor, isMutation: true });
  if (!rl) return;
  const body = await readJsonBody(request);
  const result = await searchIntelligenceService.analyzeQuery(body, { ...baseContext, ...body.context });
  sendEnvelope(response, 200, { ok: true, data: result, meta: {} }, rl);
}

// ── Business intelligence domain handlers ────────────────────────────────────

async function handleBusinessIntelligenceProfiles(request, response, identity) {
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
];

function createRequestHandler(baseContext = {}) {
  return async function requestHandler(request, response) {
    const url = new URL(request.url, "http://127.0.0.1");
    const rawPathname = url.pathname;

    const startedAt = Date.now();
    const correlationId = request.headers["x-request-id"] || require("node:crypto").randomUUID();
    response.setHeader("X-Request-ID", correlationId);

    response.on("finish", () => {
      logRequestEvent("request", {
        method: request.method,
        path: rawPathname,
        status: response.statusCode,
        durationMs: Date.now() - startedAt,
        correlationId,
      });
    });

    try {
      // OPTIONS preflight — handle before any other logic
      if (request.method === "OPTIONS") {
        const preflightHeaders = {};
        addSecurityHeaders(preflightHeaders);
        response.writeHead(204, preflightHeaders);
        response.end();
        return;
      }

      // Redirect legacy unversioned paths → /v1/<path> (301 permanent)
      if (!rawPathname.startsWith("/v1")) {
        const target = `/v1${rawPathname}${url.search}`;
        const redirectHeaders = { Location: target, Deprecation: "true" };
        addSecurityHeaders(redirectHeaders);
        response.writeHead(301, redirectHeaders);
        response.end();
        return;
      }

      // Strip /v1 prefix — all route matching below uses the unversioned pathname.
      const pathname = rawPathname.slice(3) || "/";

      // Resolve identity once per request (async JWT verification)
      const identity = await resolveRequestIdentity(request);

      // ── Unprotected routes ────────────────────────────────────────────────

      if (pathname === "/health") {
        if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
        const rl = applyRateLimit(request, response);
        if (!rl) return;
        const healthData = await buildHealthPayload();
        const healthStatus = healthData.deployable ? 200 : 503;
        sendEnvelope(response, healthStatus, { ok: healthData.deployable, data: healthData, meta: {} }, rl);
        return;
      }

      if (pathname === "/ready") {
        if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
        sendEnvelope(response, 200, { ok: true, data: buildReadinessPayload(), meta: {} });
        return;
      }

      if (pathname === "/modules") {
        if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
        sendEnvelope(response, 200, { ok: true, data: buildModulesPayload(), meta: {} });
        return;
      }

      // ── Module run routes ─────────────────────────────────────────────────

      if (pathname === "/run/default") {
        await handleDefaultRun(request, response);
        return;
      }

      if (pathname === "/run/activation-aware") {
        await handleActivationAwareRun(request, response);
        return;
      }

      if (/^\/modules\/[^/]+\/run$/.test(pathname)) {
        await handleSingleModuleRun(request, response, pathname);
        return;
      }

      // ── Execution lifecycle routes ────────────────────────────────────────

      if (pathname === "/execution/recommendations") {
        await handleExecutionRecommendations(request, response, baseContext, identity);
        return;
      }

      if (/^\/execution\/recommendations\/[^/]+\/status$/.test(pathname)) {
        await handleExecutionRecommendationStatus(request, response, pathname, baseContext, identity);
        return;
      }

      if (/^\/execution\/recommendations\/[^/]+\/tasks$/.test(pathname)) {
        await handleExecutionRecommendationTaskCreation(request, response, pathname, baseContext, identity);
        return;
      }

      if (pathname === "/execution/tasks") {
        await handleExecutionTasks(request, response, baseContext);
        return;
      }

      if (/^\/execution\/tasks\/[^/]+\/history$/.test(pathname)) {
        await handleExecutionTaskHistory(request, response, pathname, baseContext);
        return;
      }

      if (/^\/execution\/tasks\/[^/]+\/status$/.test(pathname)) {
        await handleExecutionTaskStatus(request, response, pathname, baseContext, identity);
        return;
      }

      if (/^\/execution\/tasks\/[^/]+$/.test(pathname)) {
        await handleExecutionTask(request, response, pathname, baseContext);
        return;
      }

      if (pathname === "/execution/audit-logs") {
        await handleExecutionAuditLogs(request, response, baseContext);
        return;
      }

      // ── Measurement domain routes ─────────────────────────────────────────

      if (pathname === "/measurement/metrics") {
        await handleMeasurementMetrics(request, response);
        return;
      }

      if (pathname === "/measurement/snapshots") {
        await handleMeasurementSnapshots(request, response, identity);
        return;
      }

      if (pathname === "/measurement/attributions" || /^\/measurement\/attributions\/[^/]+$/.test(pathname)) {
        await handleMeasurementAttributions(request, response, pathname, identity);
        return;
      }

      // ── Technical operations domain routes ────────────────────────────────

      if (pathname === "/technical-operations/audit") {
        await handleTechnicalOperationsAudit(request, response, identity);
        return;
      }

      // ── Search intelligence domain routes ─────────────────────────────────

      if (pathname === "/search-intelligence/classify") {
        await handleSearchIntelligenceClassify(request, response, identity);
        return;
      }

      if (pathname === "/search-intelligence/analyze") {
        await handleSearchIntelligenceAnalyze(request, response, baseContext, identity);
        return;
      }

      // ── Business intelligence domain routes ───────────────────────────────

      if (pathname === "/business-intelligence/profiles") {
        await handleBusinessIntelligenceProfiles(request, response, identity);
        return;
      }

      // ── OpenAPI spec + Swagger UI ─────────────────────────────────────────

      if (pathname === "/openapi.json") {
        if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
        const headers = { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(SPEC_JSON) };
        addSecurityHeaders(headers);
        response.writeHead(200, headers);
        response.end(SPEC_JSON);
        return;
      }

      if (pathname === "/docs") {
        if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
        const headers = { "Content-Type": "text/html; charset=utf-8", "Content-Length": Buffer.byteLength(SWAGGER_UI_HTML) };
        addSecurityHeaders(headers);
        response.writeHead(200, headers);
        response.end(SWAGGER_UI_HTML);
        return;
      }

      // ── 404 ───────────────────────────────────────────────────────────────

      sendEnvelope(response, 404, {
        ok: false,
        error: { code: "not_found", message: "Route was not found." },
        meta: { availableRoutes: AVAILABLE_ROUTES, registeredModules: getRegisteredModuleKeys() },
      });
    } catch (error) {
      const normalizedError = normalizeError(error);
      logRequestEvent("api_error", {
        method: request.method,
        path: rawPathname,
        code: normalizedError.code,
        statusCode: normalizedError.statusCode,
        headers: request.headers,
      });
      if (normalizedError.statusCode >= 500) {
        reportError(error, { tags: { route: rawPathname, method: request.method } });
      }
      sendEnvelope(response, normalizedError.statusCode, {
        ok: false,
        error: { code: normalizedError.code, message: normalizedError.message },
        meta: { details: normalizedError.details },
      });
    }
  };
}

function createServer({ baseContext = {} } = {}) {
  return http.createServer(createRequestHandler(baseContext));
}

async function startServer({ port = Number(process.env.PORT) || 10000, host = "0.0.0.0" } = {}) {
  const dbPool = await initDb();
  const baseContext = dbPool ? { query: (sql, params) => dbPool.query(sql, params) } : {};

  return new Promise((resolve, reject) => {
    const server = createServer({ baseContext });
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
  requestHandler: createRequestHandler(),
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
