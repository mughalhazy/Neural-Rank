const assert = require("node:assert/strict");
const http = require("node:http");

const { createServer } = require("./server");

function request(server, method, path, payload) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const body = payload === undefined ? null : JSON.stringify(payload);

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: address.port,
        path,
        method,
        headers: body
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(body),
            }
          : {},
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
    const response = await request(server, "GET", "/health");
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, "ok");
    assert.equal(response.body.deployable, true);
    assert.equal(response.body.activeModuleCount, 8);
    assert.equal(response.body.inactiveModules.length, 0);
  });
}

async function testModulesRoute() {
  await withServer(async (server) => {
    const response = await request(server, "GET", "/modules");
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.modules.length, 8);
  });
}

async function testDefaultRunRoute() {
  await withServer(async (server) => {
    const response = await request(server, "POST", "/run/default", {
      moduleInputs: {
        review_analysis: {
          websiteUrl: "https://example.com",
          reviews: [{ rating: 1, text: "checkout is slow and crashes" }],
        },
      },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(Object.keys(response.body.results).length, 8);
    assert.equal(response.body.results.review_analysis.status, "completed");
  });
}

async function testSingleModuleRoute() {
  await withServer(async (server) => {
    const response = await request(server, "POST", "/modules/keyword_analysis/run", {
      moduleInput: {
        websiteUrl: "https://example.com",
        keywords: [{ keyword: "seo platform", position: 22, difficulty: 20, volume: 800 }],
      },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.moduleKey, "keyword_analysis");
    assert.equal(response.body.status, "completed");
    assert.ok(response.body.flow.action.length >= 1);
  });
}

async function run() {
  await testHealthRoute();
  await testModulesRoute();
  await testDefaultRunRoute();
  await testSingleModuleRoute();
  console.log("server tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
