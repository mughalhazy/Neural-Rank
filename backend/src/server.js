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
const {
  getExecutionService,
} = require("./domains/execution/service");
const { normalizeError } = require("./api/errors");
const {
  extractRequestIdentity,
  requireMutationIdentity,
  validateFlowRunBody,
  validateModuleRunBody,
  validateRecommendationCreateBody,
  validateRecommendationStatusBody,
  validateTaskCreateBody,
  validateTaskStatusBody,
} = require("./api/validation");

function sendEnvelope(response, statusCode, { ok, data = null, error = null, meta = {} }) {
  const body = JSON.stringify(
    {
      ok,
      data,
      error,
      meta,
    },
    null,
    2,
  );
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "X-RateLimit-Policy": "placeholder",
    "X-RateLimit-Enforced": "false",
  });
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
      error: {
        code: "method_not_allowed",
        message: "HTTP method is not allowed for this route.",
      },
      meta: {},
    }),
  );
}

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
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("invalid_json"));
      }
    });

    request.on("error", reject);
  });
}

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
    checks: {
      http: "pass",
      executionLifecycle: "pass",
      governance: "pass",
    },
  };
}

function buildModulesPayload() {
  return {
    modules: moduleCatalog.map((moduleDefinition) => ({
      moduleKey: moduleDefinition.moduleKey,
      displayName: moduleDefinition.displayName,
      defaultActive: moduleDefinition.defaultActive,
      initialState: moduleDefinition.initialState,
    })),
  };
}

async function handleDefaultRun(request, response) {
  if (request.method !== "POST") {
    sendMethodNotAllowed(response, ["POST"]);
    return;
  }

  const body = await readJsonBody(request);
  validateFlowRunBody(body);
  const result = await runDefaultBackendFlow(body.moduleInputs || {}, body.context || {});
  sendEnvelope(response, 200, { ok: true, data: result, meta: {} });
}

async function handleActivationAwareRun(request, response) {
  if (request.method !== "POST") {
    sendMethodNotAllowed(response, ["POST"]);
    return;
  }

  const body = await readJsonBody(request);
  validateFlowRunBody(body);
  const result = await runActivationAwareFlow(
    body.moduleInputs || {},
    body.context || {},
    body.activationOverrides || {},
    body.options || {},
  );
  sendEnvelope(response, 200, { ok: true, data: result, meta: {} });
}

async function handleSingleModuleRun(request, response, pathname) {
  if (request.method !== "POST") {
    sendMethodNotAllowed(response, ["POST"]);
    return;
  }

  const match = pathname.match(/^\/modules\/([^/]+)\/run$/);
  const moduleKey = match ? decodeURIComponent(match[1]) : null;
  const service = moduleKey ? getModuleService(moduleKey) : null;

  if (!moduleKey || !service || typeof service.run !== "function") {
    sendEnvelope(response, 404, {
      ok: false,
      error: {
        code: "module_not_found",
        message: "Requested module was not found.",
      },
      meta: { moduleKey },
    });
    return;
  }

  const body = await readJsonBody(request);
  validateModuleRunBody(body);
  const result = await service.run(body.moduleInput || {}, body.context || {});
  sendEnvelope(response, 200, { ok: true, data: result, meta: { moduleKey } });
}

function createRequestContext(baseContext = {}, bodyContext = {}, identity = {}) {
  return {
    ...baseContext,
    ...bodyContext,
    requestIdentity: identity,
  };
}

function logRequestEvent(kind, payload = {}) {
  const sanitizedPayload = { ...payload };
  if (sanitizedPayload.headers) {
    delete sanitizedPayload.headers.authorization;
    delete sanitizedPayload.headers["x-service-key"];
    delete sanitizedPayload.headers["x-api-key"];
  }
  console.log(JSON.stringify({ kind, ...sanitizedPayload }));
}

function buildExecutionPayloadList(items = [], key) {
  return {
    [key]: items,
    count: items.length,
  };
}

async function handleExecutionRecommendations(request, response, baseContext) {
  const executionService = getExecutionService();

  if (request.method === "GET") {
    const recommendations = await executionService.listRecommendations(baseContext);
    sendEnvelope(response, 200, {
      ok: true,
      data: buildExecutionPayloadList(recommendations, "recommendations"),
      meta: {},
    });
    return;
  }

  if (request.method === "POST") {
    const body = await readJsonBody(request);
    const identity = extractRequestIdentity(request);
    requireMutationIdentity(identity);
    validateRecommendationCreateBody(body.recommendation || body);
    const recommendation = await executionService.createRecommendation(
      body.recommendation || body,
      createRequestContext(baseContext, body.context || {}, identity),
    );
    sendEnvelope(response, 201, {
      ok: true,
      data: recommendation,
      meta: {
        actor: identity.actor,
        auditable: true,
        clientId: identity.clientId,
        workspaceId: identity.workspaceId,
      },
    });
    return;
  }

  sendMethodNotAllowed(response, ["GET", "POST"]);
}

async function handleExecutionRecommendationStatus(request, response, pathname, baseContext) {
  if (request.method !== "PATCH") {
    sendMethodNotAllowed(response, ["PATCH"]);
    return;
  }

  const match = pathname.match(/^\/execution\/recommendations\/([^/]+)\/status$/);
  const recommendationId = match ? decodeURIComponent(match[1]) : null;

  if (!recommendationId) {
    sendEnvelope(response, 404, {
      ok: false,
      error: {
        code: "recommendation_not_found",
        message: "Recommendation was not found.",
      },
      meta: {},
    });
    return;
  }

  const body = await readJsonBody(request);
  const identity = extractRequestIdentity(request);
  requireMutationIdentity(identity);
  validateRecommendationStatusBody(body);
  const updated = await getExecutionService().updateRecommendationStatus(
    recommendationId,
    body,
    createRequestContext(baseContext, body.context || {}, identity),
  );
  sendEnvelope(response, 200, {
    ok: true,
    data: updated,
    meta: {
      actor: identity.actor,
      auditable: true,
      clientId: identity.clientId,
      workspaceId: identity.workspaceId,
    },
  });
}

async function handleExecutionRecommendationTaskCreation(request, response, pathname, baseContext) {
  if (request.method !== "POST") {
    sendMethodNotAllowed(response, ["POST"]);
    return;
  }

  const match = pathname.match(/^\/execution\/recommendations\/([^/]+)\/tasks$/);
  const recommendationId = match ? decodeURIComponent(match[1]) : null;

  if (!recommendationId) {
    sendEnvelope(response, 404, {
      ok: false,
      error: {
        code: "recommendation_not_found",
        message: "Recommendation was not found.",
      },
      meta: {},
    });
    return;
  }

  const body = await readJsonBody(request);
  const identity = extractRequestIdentity(request);
  requireMutationIdentity(identity);
  validateTaskCreateBody(body);
  const task = await getExecutionService().createTaskFromRecommendation(
    recommendationId,
    body,
    createRequestContext(baseContext, body.context || {}, identity),
  );
  sendEnvelope(response, 201, {
    ok: true,
    data: task,
    meta: {
      actor: identity.actor,
      auditable: true,
      clientId: identity.clientId,
      workspaceId: identity.workspaceId,
    },
  });
}

async function handleExecutionTasks(request, response, baseContext) {
  const executionService = getExecutionService();

  if (request.method === "GET") {
    const tasks = await executionService.listTasks(baseContext);
    sendEnvelope(response, 200, {
      ok: true,
      data: buildExecutionPayloadList(tasks, "tasks"),
      meta: {},
    });
    return;
  }

  sendMethodNotAllowed(response, ["GET"]);
}

async function handleExecutionTask(request, response, pathname, baseContext) {
  if (request.method !== "GET") {
    sendMethodNotAllowed(response, ["GET"]);
    return;
  }

  const match = pathname.match(/^\/execution\/tasks\/([^/]+)$/);
  const taskId = match ? decodeURIComponent(match[1]) : null;
  const task = taskId ? await getExecutionService().getTask(taskId, baseContext) : null;

  if (!task) {
    sendEnvelope(response, 404, {
      ok: false,
      error: {
        code: "task_not_found",
        message: "Task was not found.",
      },
      meta: {},
    });
    return;
  }

  sendEnvelope(response, 200, { ok: true, data: task, meta: {} });
}

async function handleExecutionTaskStatus(request, response, pathname, baseContext) {
  if (request.method !== "PATCH") {
    sendMethodNotAllowed(response, ["PATCH"]);
    return;
  }

  const match = pathname.match(/^\/execution\/tasks\/([^/]+)\/status$/);
  const taskId = match ? decodeURIComponent(match[1]) : null;

  if (!taskId) {
    sendEnvelope(response, 404, {
      ok: false,
      error: {
        code: "task_not_found",
        message: "Task was not found.",
      },
      meta: {},
    });
    return;
  }

  const body = await readJsonBody(request);
  const identity = extractRequestIdentity(request);
  requireMutationIdentity(identity);
  validateTaskStatusBody(body);
  const updated = await getExecutionService().updateTaskStatus(
    taskId,
    body,
    createRequestContext(baseContext, body.context || {}, identity),
  );
  sendEnvelope(response, 200, {
    ok: true,
    data: updated,
    meta: {
      actor: identity.actor,
      auditable: true,
      clientId: identity.clientId,
      workspaceId: identity.workspaceId,
    },
  });
}

async function handleExecutionTaskHistory(request, response, pathname, baseContext) {
  if (request.method !== "GET") {
    sendMethodNotAllowed(response, ["GET"]);
    return;
  }

  const match = pathname.match(/^\/execution\/tasks\/([^/]+)\/history$/);
  const taskId = match ? decodeURIComponent(match[1]) : null;

  if (!taskId) {
    sendEnvelope(response, 404, {
      ok: false,
      error: {
        code: "task_not_found",
        message: "Task was not found.",
      },
      meta: {},
    });
    return;
  }

  const history = await getExecutionService().listTaskStatusHistory(taskId, baseContext);
  sendEnvelope(response, 200, {
    ok: true,
    data: buildExecutionPayloadList(history, "history"),
    meta: {},
  });
}

async function handleExecutionAuditLogs(request, response, baseContext) {
  if (request.method !== "GET") {
    sendMethodNotAllowed(response, ["GET"]);
    return;
  }

  const auditLogs = await getExecutionService().listAuditLogs(baseContext);
  sendEnvelope(response, 200, {
    ok: true,
    data: buildExecutionPayloadList(auditLogs, "auditLogs"),
    meta: {},
  });
}

function createRequestHandler(baseContext = {}) {
  return async function requestHandler(request, response) {
    const url = new URL(request.url, "http://127.0.0.1");
    const { pathname } = url;

    try {
      if (pathname === "/health") {
        if (request.method !== "GET") {
          sendMethodNotAllowed(response, ["GET"]);
          return;
        }

        sendEnvelope(response, 200, { ok: true, data: buildHealthPayload(), meta: {} });
        return;
      }

      if (pathname === "/ready") {
        if (request.method !== "GET") {
          sendMethodNotAllowed(response, ["GET"]);
          return;
        }

        sendEnvelope(response, 200, { ok: true, data: buildReadinessPayload(), meta: {} });
        return;
      }

      if (pathname === "/modules") {
        if (request.method !== "GET") {
          sendMethodNotAllowed(response, ["GET"]);
          return;
        }

        sendEnvelope(response, 200, { ok: true, data: buildModulesPayload(), meta: {} });
        return;
      }

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

      if (pathname === "/execution/recommendations") {
        await handleExecutionRecommendations(request, response, baseContext);
        return;
      }

      if (/^\/execution\/recommendations\/[^/]+\/status$/.test(pathname)) {
        await handleExecutionRecommendationStatus(request, response, pathname, baseContext);
        return;
      }

      if (/^\/execution\/recommendations\/[^/]+\/tasks$/.test(pathname)) {
        await handleExecutionRecommendationTaskCreation(request, response, pathname, baseContext);
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
        await handleExecutionTaskStatus(request, response, pathname, baseContext);
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

      sendEnvelope(response, 404, {
        ok: false,
        error: {
          code: "not_found",
          message: "Route was not found.",
        },
        meta: {
          availableRoutes: [
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
          ],
          registeredModules: getRegisteredModuleKeys(),
        },
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
        error: {
          code: normalizedError.code,
          message: normalizedError.message,
        },
        meta: {
          details: normalizedError.details,
        },
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
      const resolvedPort =
        address && typeof address === "object" ? address.port : process.env.PORT || 10000;
      console.log(`neural-rank-backend listening on 0.0.0.0:${resolvedPort}`);
    })
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exit(1);
    });
}
