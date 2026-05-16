const http = require("node:http");
const { URL } = require("node:url");

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
const { resolveRequestIdentity, requireIdentity, requireWorkspace } = require("./api/auth");
const {
  validateFlowRunBody,
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

function sendEnvelope(response, statusCode, { ok, data = null, error = null, meta = {} }, rateLimitInfo = null) {
  const body = JSON.stringify({ ok, data, error, meta }, null, 2);
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  };

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
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("payload_too_large"));
        request.destroy();
      }
    });
    request.on("end", () => {
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

function buildHealthPayload() {
  const activationState = getDefaultActivationState();
  const grouped = listModulesByActivation();
  return {
    status: "ok",
    service: "neural-rank-backend",
    deployable: true,
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
  const result = await service.run(body.moduleInput || {}, body.context || {});
  sendEnvelope(response, 200, { ok: true, data: result, meta: { moduleKey } }, rl);
}

// ── Execution lifecycle handlers ──────────────────────────────────────────────

function buildExecutionPayloadList(items = [], key) {
  return { [key]: items, count: items.length };
}

function buildRequestContext(baseContext = {}, bodyContext = {}, identity = {}) {
  return {
    ...baseContext,
    ...bodyContext,
    requestIdentity: identity,
    workspaceId: identity.workspaceId || null,
  };
}

async function handleExecutionRecommendations(request, response, baseContext, identity) {
  const executionService = getExecutionService();
  const rl = applyRateLimit(request, response);
  if (!rl) return;

  if (request.method === "GET") {
    const recommendations = await executionService.listRecommendations(baseContext);
    sendEnvelope(response, 200, { ok: true, data: buildExecutionPayloadList(recommendations, "recommendations"), meta: {} }, rl);
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
  const tasks = await getExecutionService().listTasks(baseContext);
  sendEnvelope(response, 200, { ok: true, data: buildExecutionPayloadList(tasks, "tasks"), meta: {} }, rl);
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
  const auditLogs = await getExecutionService().listAuditLogs(baseContext);
  sendEnvelope(response, 200, { ok: true, data: buildExecutionPayloadList(auditLogs, "auditLogs"), meta: {} }, rl);
}

// ── Measurement domain handlers ───────────────────────────────────────────────

async function handleMeasurementMetrics(request, response) {
  if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const sources = await measurementService.listMetricSources();
  sendEnvelope(response, 200, { ok: true, data: { metrics: sources, count: sources.length }, meta: {} }, rl);
}

async function handleMeasurementSnapshots(request, response) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const body = await readJsonBody(request);
  const kind = body.snapshotKind || body.kind || "baseline";
  const result = kind === "post_change"
    ? await measurementService.recordPostChangeSnapshot(body)
    : await measurementService.recordBaselineSnapshot(body);
  sendEnvelope(response, 201, { ok: true, data: result, meta: { snapshotKind: kind } }, rl);
}

async function handleMeasurementAttributions(request, response, pathname) {
  const rl = applyRateLimit(request, response);
  if (!rl) return;

  if (request.method === "POST" && pathname === "/measurement/attributions") {
    const body = await readJsonBody(request);
    const result = await measurementService.recordAttributionLink(body);
    sendEnvelope(response, 201, { ok: true, data: result, meta: {} }, rl);
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

async function handleTechnicalOperationsAudit(request, response) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const body = await readJsonBody(request);
  const result = await technicalOperationsService.auditTechnicalSeo(body);
  sendEnvelope(response, 200, { ok: true, data: result, meta: {} }, rl);
}

// ── Search intelligence domain handlers ──────────────────────────────────────

async function handleSearchIntelligenceClassify(request, response) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const body = await readJsonBody(request);
  const result = await searchIntelligenceService.classifyIntent(body);
  sendEnvelope(response, 200, { ok: true, data: result, meta: {} }, rl);
}

async function handleSearchIntelligenceAnalyze(request, response, baseContext) {
  if (request.method !== "POST") { sendMethodNotAllowed(response, ["POST"]); return; }
  const rl = applyRateLimit(request, response);
  if (!rl) return;
  const body = await readJsonBody(request);
  const result = await searchIntelligenceService.analyzeQuery(body, { ...baseContext, ...body.context });
  sendEnvelope(response, 200, { ok: true, data: result, meta: {} }, rl);
}

// ── Business intelligence domain handlers ────────────────────────────────────

async function handleBusinessIntelligenceProfiles(request, response) {
  const rl = applyRateLimit(request, response);
  if (!rl) return;

  if (request.method === "GET") {
    const profiles = await businessIntelligenceService.listBusinessProfiles();
    sendEnvelope(response, 200, { ok: true, data: { profiles, count: profiles.length }, meta: {} }, rl);
    return;
  }

  if (request.method === "POST") {
    const body = await readJsonBody(request);
    const result = await businessIntelligenceService.createBusinessProfile(body);
    sendEnvelope(response, 201, { ok: true, data: result, meta: {} }, rl);
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
  "GET /health",
  "GET /ready",
  "GET /modules",
  "POST /run/default",
  "POST /run/activation-aware",
  "POST /modules/:moduleKey/run",
  "GET /execution/recommendations",
  "POST /execution/recommendations",
  "PATCH /execution/recommendations/:recommendationId/status",
  "POST /execution/recommendations/:recommendationId/tasks",
  "GET /execution/tasks",
  "GET /execution/tasks/:taskId",
  "PATCH /execution/tasks/:taskId/status",
  "GET /execution/tasks/:taskId/history",
  "GET /execution/audit-logs",
  "GET /measurement/metrics",
  "POST /measurement/snapshots",
  "POST /measurement/attributions",
  "GET /measurement/attributions/:attributionId",
  "POST /technical-operations/audit",
  "POST /search-intelligence/classify",
  "POST /search-intelligence/analyze",
  "GET /business-intelligence/profiles",
  "POST /business-intelligence/profiles",
];

function createRequestHandler(baseContext = {}) {
  return async function requestHandler(request, response) {
    const url = new URL(request.url, "http://127.0.0.1");
    const { pathname } = url;

    try {
      // Resolve identity once per request (async JWT verification)
      const identity = await resolveRequestIdentity(request);

      // ── Unprotected routes ────────────────────────────────────────────────

      if (pathname === "/health") {
        if (request.method !== "GET") { sendMethodNotAllowed(response, ["GET"]); return; }
        const rl = applyRateLimit(request, response);
        if (!rl) return;
        sendEnvelope(response, 200, { ok: true, data: buildHealthPayload(), meta: {} }, rl);
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
        await handleMeasurementSnapshots(request, response);
        return;
      }

      if (pathname === "/measurement/attributions" || /^\/measurement\/attributions\/[^/]+$/.test(pathname)) {
        await handleMeasurementAttributions(request, response, pathname);
        return;
      }

      // ── Technical operations domain routes ────────────────────────────────

      if (pathname === "/technical-operations/audit") {
        await handleTechnicalOperationsAudit(request, response);
        return;
      }

      // ── Search intelligence domain routes ─────────────────────────────────

      if (pathname === "/search-intelligence/classify") {
        await handleSearchIntelligenceClassify(request, response);
        return;
      }

      if (pathname === "/search-intelligence/analyze") {
        await handleSearchIntelligenceAnalyze(request, response, baseContext);
        return;
      }

      // ── Business intelligence domain routes ───────────────────────────────

      if (pathname === "/business-intelligence/profiles") {
        await handleBusinessIntelligenceProfiles(request, response);
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
        path: pathname,
        code: normalizedError.code,
        statusCode: normalizedError.statusCode,
        headers: request.headers,
      });
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

function startServer({ port = Number(process.env.PORT) || 10000, host = "0.0.0.0" } = {}) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(port, host, () => {
      server.removeListener("error", reject);
      resolve(server);
    });
  });
}

module.exports = {
  buildHealthPayload,
  buildReadinessPayload,
  buildModulesPayload,
  createRequestHandler,
  createServer,
  requestHandler: createRequestHandler(),
  startServer,
};

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
