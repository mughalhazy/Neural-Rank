const assert = require("node:assert/strict");

const { runOptimizationLayer } = require("./service");
const { getDefaultActivationState } = require("../../core/activation");

async function testStructuredOptimizationInputProducesPrioritizedActions() {
  const result = await runOptimizationLayer(
    {
      websiteUrl: "https://example.com",
      sections: [
        {
          title: "SEO platform",
          content: "Short body",
          metadata: {
            title: "",
            description: "",
          },
        },
      ],
      targetKeywords: ["seo", "rank tracking", "aso"],
    },
    {},
  );

  assert.equal(result.moduleKey, "optimization_layer");
  assert.equal(result.status, "completed");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.sections.length, 1);
  assert.ok(result.flow.insight.length >= 1);
  assert.ok(result.flow.action.length >= 1);
  assert.ok(["high", "medium", "low"].includes(result.flow.action[0].priority));
  assert.notEqual(result.flow.action[0].type, "optimization_monitoring_action");
}

async function testAdapterFallbackProvidesOptimizationInput() {
  const result = await runOptimizationLayer(
    {
      appId: "com.example.app",
    },
    {
      integrationOverrides: {
        optimization_layer: {
          async collect() {
            return {
              status: "adapter_supplied",
              sections: [
                {
                  title: "Listing page",
                  content: "Thin copy",
                  metadata: {
                    title: "",
                    description: "",
                  },
                },
              ],
              targetKeywords: ["aso", "growth"],
            };
          },
        },
      },
    },
  );

  assert.equal(result.integrationStatus, "adapter_supplied");
  assert.equal(result.flow.input.sections.length, 1);
  assert.ok(result.flow.action.length >= 1);
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runOptimizationLayer(
    {
      websiteUrl: "https://example.com",
      sections: [
        {
          title: "SEO platform",
          content: "Short body",
          metadata: {
            title: "",
            description: "",
          },
        },
      ],
      targetKeywords: ["seo"],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) {
          return { rows: [{ id: 51 }] };
        }

        return { rows: [{ id: 94 }] };
      },
    },
  );

  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.optimization_layer_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
  assert.ok(result.flow.action.length >= 1);
}

function testOptimizationIsActiveByDefault() {
  const activationState = getDefaultActivationState();
  assert.equal(activationState.optimization_layer, true);
}

async function run() {
  testOptimizationIsActiveByDefault();
  await testStructuredOptimizationInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesOptimizationInput();
  await testQueryBackedPersistencePath();
  console.log("optimization-layer tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
