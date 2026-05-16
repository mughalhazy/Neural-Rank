const assert = require("node:assert/strict");

const { runCreativeMessagingLayer } = require("./service");
const { getDefaultActivationState } = require("../../core/activation");

async function testStructuredCreativeInputProducesPrioritizedActions() {
  const result = await runCreativeMessagingLayer(
    {
      websiteUrl: "https://example.com",
      assets: [
        {
          headline: "",
          body: "Short body",
          callToAction: "",
        },
      ],
      targetThemes: ["seo", "growth"],
    },
    {},
  );

  assert.equal(result.moduleKey, "creative_messaging_layer");
  assert.equal(result.status, "completed");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.assets.length, 1);
  assert.ok(result.flow.insight.length >= 1);
  assert.ok(result.flow.action.length >= 1);
  assert.notEqual(result.flow.action[0].type, "messaging_monitoring_action");
}

async function testAdapterFallbackProvidesCreativeInput() {
  const result = await runCreativeMessagingLayer(
    {
      appId: "com.example.app",
    },
    {
      integrationOverrides: {
        creative_messaging_layer: {
          async collect() {
            return {
              status: "adapter_supplied",
              assets: [
                {
                  headline: "",
                  body: "Thin messaging",
                  callToAction: "",
                },
              ],
              targetThemes: ["seo", "growth"],
            };
          },
        },
      },
    },
  );

  assert.equal(result.integrationStatus, "adapter_supplied");
  assert.equal(result.flow.input.assets.length, 1);
  assert.ok(result.flow.action.length >= 1);
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runCreativeMessagingLayer(
    {
      websiteUrl: "https://example.com",
      assets: [
        {
          headline: "",
          body: "Short body",
          callToAction: "",
        },
      ],
      targetThemes: ["seo"],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) {
          return { rows: [{ id: 61 }] };
        }

        return { rows: [{ id: 95 }] };
      },
    },
  );

  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.creative_messaging_layer_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
  assert.ok(result.flow.action.length >= 1);
}

function testCreativeMessagingIsActiveByDefault() {
  const activationState = getDefaultActivationState();
  assert.equal(activationState.creative_messaging_layer, true);
}

async function run() {
  testCreativeMessagingIsActiveByDefault();
  await testStructuredCreativeInputProducesPrioritizedActions();
  await testAdapterFallbackProvidesCreativeInput();
  await testQueryBackedPersistencePath();
  console.log("creative-messaging-layer tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
