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

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function sendMethodNotAllowed(response, allowedMethods) {
  response.writeHead(405, {
    Allow: allowedMethods.join(", "),
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify({ error: "method_not_allowed" }));
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
  const result = await runDefaultBackendFlow(body.moduleInputs || {}, body.context || {});
  sendJson(response, 200, result);
}

async function handleActivationAwareRun(request, response) {
  if (request.method !== "POST") {
    sendMethodNotAllowed(response, ["POST"]);
    return;
  }

  const body = await readJsonBody(request);
  const result = await runActivationAwareFlow(
    body.moduleInputs || {},
    body.context || {},
    body.activationOverrides || {},
    body.options || {},
  );
  sendJson(response, 200, result);
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
    sendJson(response, 404, { error: "module_not_found", moduleKey });
    return;
  }

  const body = await readJsonBody(request);
  const result = await service.run(body.moduleInput || {}, body.context || {});
  sendJson(response, 200, result);
}

async function requestHandler(request, response) {
  const url = new URL(request.url, "http://127.0.0.1");
  const { pathname } = url;

  try {
    if (pathname === "/health") {
      if (request.method !== "GET") {
        sendMethodNotAllowed(response, ["GET"]);
        return;
      }

      sendJson(response, 200, buildHealthPayload());
      return;
    }

    if (pathname === "/modules") {
      if (request.method !== "GET") {
        sendMethodNotAllowed(response, ["GET"]);
        return;
      }

      sendJson(response, 200, buildModulesPayload());
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

    sendJson(response, 404, {
      error: "not_found",
      availableRoutes: [
        "GET /health",
        "GET /modules",
        "POST /run/default",
        "POST /run/activation-aware",
        "POST /modules/:moduleKey/run",
      ],
      registeredModules: getRegisteredModuleKeys(),
    });
  } catch (error) {
    const statusCode = error.message === "invalid_json" ? 400 : 500;
    sendJson(response, statusCode, {
      error: error.message || "internal_server_error",
    });
  }
}

function createServer() {
  return http.createServer(requestHandler);
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
  buildModulesPayload,
  createServer,
  requestHandler,
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
