const assert = require("node:assert/strict");
const http = require("node:http");

const { createServer } = require("./server");
const { resetExecutionServiceState } = require("./domains/execution/service");

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
            ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
            : {}),
          ...headers,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => { raw += chunk; });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: raw ? JSON.parse(raw) : {} });
        });
      },
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function withServer(run) {
  resetExecutionServiceState();
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", (error) => { if (error) reject(error); else resolve(); });
  });
  try {
    await run(server);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    resetExecutionServiceState();
  }
}

// ── 404 Unknown route ─────────────────────────────────────────────────────────

async function testUnknownRoute() {
  await withServer(async (server) => {
    const res = await request(server, "GET", "/v1/does-not-exist");
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.error.code, "not_found");
  });
}

// ── 301 Legacy unversioned redirect ──────────────────────────────────────────

async function testUnversionedRedirect() {
  await withServer(async (server) => {
    const res = await request(server, "GET", "/health");
    assert.equal(res.statusCode, 301);
    assert.ok(res.headers.location.endsWith("/v1/health"));
    assert.equal(res.headers.deprecation, "true");
  });
}

// ── 405 Wrong method ─────────────────────────────────────────────────────────

async function testWrongMethod() {
  await withServer(async (server) => {
    const res = await request(server, "DELETE", "/v1/health");
    assert.equal(res.statusCode, 405);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.error.code, "method_not_allowed");
  });
}

// ── 400 Invalid JSON body ─────────────────────────────────────────────────────

async function testInvalidJsonBody() {
  await withServer(async (server) => {
    const address = server.address();
    const body = "{ this is not json }";
    const res = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: address.port,
          path: "/v1/execution/recommendations",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body),
            "x-neural-rank-actor": "test-actor",
          },
        },
        (r) => {
          let raw = "";
          r.on("data", (c) => { raw += c; });
          r.on("end", () => resolve({ statusCode: r.statusCode, body: JSON.parse(raw) }));
        },
      );
      req.on("error", reject);
      req.write(body);
      req.end();
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error.code, "invalid_json");
  });
}

// ── 400 Missing required field ────────────────────────────────────────────────

async function testMissingRequiredField() {
  await withServer(async (server) => {
    const res = await request(server, "POST", "/v1/execution/recommendations", {
      sourceModuleKey: "review_analysis",
      // title and actionType are missing
    }, { "x-neural-rank-actor": "test-actor" });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.error.code, "invalid_recommendation_title");
  });
}

// ── 400 Over-limit string (title > 500 chars) ─────────────────────────────────

async function testOverLimitString() {
  await withServer(async (server) => {
    const res = await request(server, "POST", "/v1/execution/recommendations", {
      sourceModuleKey: "review_analysis",
      title: "x".repeat(501),
      actionType: "review_cluster_remediation",
    }, { "x-neural-rank-actor": "test-actor" });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.error.code, "invalid_recommendation_title");
  });
}

// ── 401 Mutation without identity ─────────────────────────────────────────────

async function testMutationWithoutIdentity() {
  await withServer(async (server) => {
    const res = await request(server, "POST", "/v1/execution/recommendations", {
      sourceModuleKey: "review_analysis",
      title: "test",
      actionType: "review_cluster_remediation",
    });
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.error.code, "missing_actor_identity");
  });
}

// ── 409 Governance block ──────────────────────────────────────────────────────

async function testGovernanceBlock() {
  await withServer(async (server) => {
    const res = await request(server, "POST", "/v1/execution/recommendations", {
      sourceModuleKey: "technical_operations",
      title: "Hidden text and mass redirect",
      summary: "Add hidden text and mass redirect unrelated pages.",
      actionType: "risky_technical_change",
      payload: { changePlan: "display:none hidden text with mass redirect unrelated pages" },
      target: { websiteUrl: "https://example.com" },
    }, { "x-neural-rank-actor": "test-actor" });
    assert.equal(res.statusCode, 409);
    assert.equal(res.body.ok, false);
    assert.ok(res.body.error.code.startsWith("governance_blocks_"));
  });
}

// ── 413 Payload too large ─────────────────────────────────────────────────────

async function testPayloadTooLarge() {
  await withServer(async (server) => {
    const address = server.address();
    const body = JSON.stringify({ data: "x".repeat(1024 * 1024 + 100) });
    const res = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: address.port,
          path: "/v1/execution/recommendations",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body),
            "x-neural-rank-actor": "test-actor",
          },
        },
        (r) => {
          let raw = "";
          r.on("data", (c) => { raw += c; });
          r.on("end", () => resolve({ statusCode: r.statusCode, body: raw ? JSON.parse(raw) : {} }));
        },
      );
      req.on("error", reject);
      req.write(body);
      req.end();
    });
    assert.equal(res.statusCode, 413);
    assert.equal(res.body.error.code, "payload_too_large");
  });
}

// ── Security headers present on all responses ─────────────────────────────────

async function testSecurityHeaders() {
  await withServer(async (server) => {
    const res = await request(server, "GET", "/v1/health");
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers["x-content-type-options"], "x-content-type-options missing");
    assert.ok(res.headers["x-frame-options"], "x-frame-options missing");
    assert.ok(res.headers["strict-transport-security"], "hsts missing");
    assert.ok(res.headers["referrer-policy"], "referrer-policy missing");
    assert.ok(res.headers["permissions-policy"], "permissions-policy missing");
    assert.ok(res.headers["x-request-id"], "x-request-id missing");
  });
}

// ── CORS preflight ────────────────────────────────────────────────────────────

async function testCorsPreflightOptions() {
  await withServer(async (server) => {
    const address = server.address();
    const res = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: address.port,
          path: "/v1/health",
          method: "OPTIONS",
        },
        (r) => {
          r.on("data", () => {});
          r.on("end", () => resolve({ statusCode: r.statusCode, headers: r.headers }));
        },
      );
      req.on("error", reject);
      req.end();
    });
    assert.equal(res.statusCode, 204);
    assert.ok(res.headers["access-control-allow-origin"]);
    assert.ok(res.headers["access-control-allow-methods"]);
  });
}

// ── 400 Module run with empty input ──────────────────────────────────────────

async function testModuleRunMissingInput() {
  await withServer(async (server) => {
    const res = await request(server, "POST", "/v1/modules/keyword_analysis/run", {
      moduleInput: {},
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.error.code, "missing_required_input");
  });
}

// ── 404 Unknown module ────────────────────────────────────────────────────────

async function testUnknownModule() {
  await withServer(async (server) => {
    const res = await request(server, "POST", "/v1/modules/nonexistent_module/run", {
      moduleInput: { websiteUrl: "https://example.com" },
    });
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error.code, "module_not_found");
  });
}

async function run() {
  await testUnknownRoute();
  await testUnversionedRedirect();
  await testWrongMethod();
  await testInvalidJsonBody();
  await testMissingRequiredField();
  await testOverLimitString();
  await testMutationWithoutIdentity();
  await testGovernanceBlock();
  await testPayloadTooLarge();
  await testSecurityHeaders();
  await testCorsPreflightOptions();
  await testModuleRunMissingInput();
  await testUnknownModule();
  console.log("negative-path tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
