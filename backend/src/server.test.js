const assert = require("node:assert/strict");
const http = require("node:http");

const { createServer } = require("./server");

function request(server, method, path, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const body = payload === undefined ? null : JSON.stringify(payload);

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: address.port,
        path,
        method,
        headers: {
          ...(body
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body),
              }
            : {}),
          ...headers,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            body: raw ? JSON.parse(raw) : {},
          });
        });
      },
    );

    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function withServer(run) {
  const server = createServer();

  await new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  try {
    await run(server);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function testHealthRoute() {
  await withServer(async (server) => {
    const response = await request(server, "GET", "/v1/health");
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.ok, true);
    assert.equal(response.body.data.status, "ok");
    assert.equal(response.body.data.deployable, true);
    assert.equal(response.body.data.activeModuleCount, 17);
    assert.equal(response.body.data.inactiveModules.length, 1);
  });
}

async function testReadinessRoute() {
  await withServer(async (server) => {
    const response = await request(server, "GET", "/v1/ready");
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.ok, true);
    assert.equal(response.body.data.status, "ready");
    assert.equal(response.body.data.checks.http, "pass");
  });
}

async function testModulesRoute() {
  await withServer(async (server) => {
    const response = await request(server, "GET", "/v1/modules");
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.ok, true);
    assert.equal(response.body.data.modules.length, 18);
  });
}

async function testDefaultRunRoute() {
  await withServer(async (server) => {
    const response = await request(server, "POST", "/v1/run/default", {
      moduleInputs: {
        review_analysis: {
          websiteUrl: "https://example.com",
          reviews: [{ rating: 1, text: "checkout is slow and crashes" }],
        },
      },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.ok, true);
    assert.equal(Object.keys(response.body.data.results).length, 17);
    assert.equal(response.body.data.results.review_analysis.status, "completed");
  });
}

async function testSingleModuleRoute() {
  await withServer(async (server) => {
    const response = await request(server, "POST", "/v1/modules/keyword_analysis/run", {
      moduleInput: {
        websiteUrl: "https://example.com",
        keywords: [{ keyword: "seo platform", position: 22, difficulty: 20, volume: 800 }],
      },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.ok, true);
    assert.equal(response.body.data.moduleKey, "keyword_analysis");
    assert.equal(response.body.data.status, "completed");
    assert.ok(response.body.data.flow.action.length >= 1);
  });
}

async function testExecutionLifecycleRoutes() {
  await withServer(async (server) => {
    const createdRecommendation = await request(server, "POST", "/v1/execution/recommendations", {
      sourceModuleKey: "review_analysis",
      title: "Queue billing issue review",
      summary: "Manual follow-up is required before any safe change is considered.",
      actionType: "review_cluster_remediation",
      payload: {
        clusterKey: "billing",
      },
      target: {
        websiteUrl: "https://example.com",
      },
      actor: "server_test",
    }, { "x-neural-rank-actor": "server_test" });

    assert.equal(createdRecommendation.statusCode, 201);
    assert.equal(createdRecommendation.body.ok, true);
    assert.equal(createdRecommendation.body.data.currentStatus, "recommended");

    const recommendationId = createdRecommendation.body.data.id;

    const recommendationList = await request(server, "GET", "/v1/execution/recommendations");
    assert.equal(recommendationList.statusCode, 200);
    assert.equal(recommendationList.body.ok, true);
    assert.equal(recommendationList.body.data.count, 1);

    const approvedRecommendation = await request(
      server,
      "PATCH",
      `/v1/execution/recommendations/${recommendationId}/status`,
      {
        nextStatus: "approved",
        actor: "reviewer",
        reason: "Approved for queued task creation.",
      },
      { "x-neural-rank-actor": "reviewer" },
    );

    assert.equal(approvedRecommendation.statusCode, 200);
    assert.equal(approvedRecommendation.body.ok, true);
    assert.equal(approvedRecommendation.body.data.currentStatus, "approved");

    const createdTask = await request(
      server,
      "POST",
      `/v1/execution/recommendations/${recommendationId}/tasks`,
      {
        actor: "reviewer",
        rollbackMetadata: {
          rollbackPlan: "Restore prior approved version.",
        },
      },
      { "x-neural-rank-actor": "reviewer" },
    );

    assert.equal(createdTask.statusCode, 201);
    assert.equal(createdTask.body.ok, true);
    assert.equal(createdTask.body.data.currentStatus, "queued");
    assert.equal(createdTask.body.data.executionStatus, "queued");

    const taskId = createdTask.body.data.id;

    const listedTasks = await request(server, "GET", "/v1/execution/tasks");
    assert.equal(listedTasks.statusCode, 200);
    assert.equal(listedTasks.body.ok, true);
    assert.equal(listedTasks.body.data.count, 1);

    const loadedTask = await request(server, "GET", `/v1/execution/tasks/${taskId}`);
    assert.equal(loadedTask.statusCode, 200);
    assert.equal(loadedTask.body.ok, true);
    assert.equal(loadedTask.body.data.id, taskId);

    const executedTask = await request(server, "PATCH", `/v1/execution/tasks/${taskId}/status`, {
      nextStatus: "executed",
      actor: "seo_ops",
      reason: "Manual work completed.",
      metadata: {
        executionTicket: "route-test-001",
      },
    }, { "x-neural-rank-actor": "seo_ops" });

    assert.equal(executedTask.statusCode, 200);
    assert.equal(executedTask.body.ok, true);
    assert.equal(executedTask.body.data.currentStatus, "executed");

    const taskHistory = await request(server, "GET", `/v1/execution/tasks/${taskId}/history`);
    assert.equal(taskHistory.statusCode, 200);
    assert.equal(taskHistory.body.ok, true);
    assert.equal(taskHistory.body.data.count, 2);
    assert.deepEqual(
      taskHistory.body.data.history.map((entry) => entry.nextStatus),
      ["queued", "executed"],
    );

    const auditLogs = await request(server, "GET", "/v1/execution/audit-logs");
    assert.equal(auditLogs.statusCode, 200);
    assert.equal(auditLogs.body.ok, true);
    assert.ok(auditLogs.body.data.count >= 5);
  });
}

async function testBlockedGovernanceRoute() {
  // T1-17: blocked recommendations must be rejected at creation time — never persisted.
  // T1-16: requiresApproval must be false for blocked classifications.
  await withServer(async (server) => {
    const blockAttempt = await request(server, "POST", "/v1/execution/recommendations", {
      sourceModuleKey: "technical_operations",
      title: "Hidden text and sitewide redirects",
      summary: "Add hidden text and mass redirect unrelated pages.",
      actionType: "risky_technical_change",
      payload: {
        changePlan: "display:none hidden text with mass redirect unrelated pages",
      },
      target: {
        websiteUrl: "https://example.com",
      },
      actor: "server_test",
    }, { "x-neural-rank-actor": "server_test" });

    // Block-classified actions must be rejected at creation — not stored in DB.
    assert.equal(blockAttempt.statusCode, 409);
    assert.equal(blockAttempt.body.ok, false);
    assert.ok(blockAttempt.body.error.code.startsWith("governance_blocks_"));

    // Confirm nothing was stored — list should have 0 recommendations in this fresh server.
    const listAfterBlock = await request(server, "GET", "/v1/execution/recommendations");
    assert.equal(listAfterBlock.statusCode, 200);
    assert.equal(listAfterBlock.body.data.count, 0);
  });
}

async function testMutationValidationAndIdentityRequirements() {
  await withServer(async (server) => {
    const noActorResponse = await request(server, "POST", "/v1/execution/recommendations", {
      sourceModuleKey: "review_analysis",
      title: "Missing actor",
      actionType: "review_cluster_remediation",
    });

    assert.equal(noActorResponse.statusCode, 401);
    assert.equal(noActorResponse.body.ok, false);
    assert.equal(noActorResponse.body.error.code, "missing_actor_identity");

    const invalidBodyResponse = await request(
      server,
      "POST",
      "/v1/execution/recommendations",
      {
        sourceModuleKey: "",
        title: "",
        actionType: "",
      },
      { "x-neural-rank-actor": "reviewer" },
    );

    assert.equal(invalidBodyResponse.statusCode, 400);
    assert.equal(invalidBodyResponse.body.ok, false);
    assert.equal(invalidBodyResponse.body.error.code, "invalid_source_module_key");
  });
}

async function testOpenApiRoutes() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    // /v1/openapi.json should return valid OpenAPI spec
    const specResponse = await request(server, "GET", "/v1/openapi.json");
    assert.equal(specResponse.statusCode, 200);
    assert.equal(specResponse.body.openapi, "3.1.0");
    assert.ok(typeof specResponse.body.paths === "object", "spec should have paths");

    // every entry in AVAILABLE_ROUTES (excluding openapi/docs meta-routes) should appear in spec
    const { AVAILABLE_ROUTES } = require("./server");
    const { SPEC } = require("./api/openapi");
    const metaRoutes = new Set(["GET /v1/openapi.json", "GET /v1/docs"]);
    for (const route of AVAILABLE_ROUTES) {
      if (metaRoutes.has(route)) continue;
      const [, rawPath] = route.split(" ");
      // convert /v1/foo/:param/bar → /foo/{param}/bar
      const specPath = rawPath.slice(3).replace(/:([^/]+)/g, "{$1}");
      assert.ok(
        Object.prototype.hasOwnProperty.call(SPEC.paths, specPath),
        `AVAILABLE_ROUTES entry '${route}' has no spec path '${specPath}'`,
      );
    }

    // /v1/docs should return HTML with swagger-ui (raw — not JSON)
    const docsStatusCode = await new Promise((resolve, reject) => {
      const address = server.address();
      const req = http.request({ hostname: "127.0.0.1", port: address.port, path: "/v1/docs", method: "GET" }, (res) => {
        res.resume();
        res.on("end", () => resolve(res.statusCode));
      });
      req.on("error", reject);
      req.end();
    });
    assert.equal(docsStatusCode, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function run() {
  await testHealthRoute();
  await testReadinessRoute();
  await testModulesRoute();
  await testDefaultRunRoute();
  await testSingleModuleRoute();
  await testExecutionLifecycleRoutes();
  await testBlockedGovernanceRoute();
  await testMutationValidationAndIdentityRequirements();
  await testOpenApiRoutes();
  console.log("server tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
