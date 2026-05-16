const assert = require("node:assert/strict");

const { runUnifiedWorkflowLayer } = require("./service");
const { getDefaultActivationState } = require("../../core/activation");

async function testUnifiedWorkflowProducesOrderedCrossModuleActions() {
  const result = await runUnifiedWorkflowLayer(
    {
      websiteUrl: "https://example.com",
      moduleResults: [
        {
          moduleKey: "keyword_analysis",
          flow: {
            insight: [{ type: "keyword_summary" }],
            priority: [
              { type: "high_keyword", priority: "high", keyword: "seo tool" },
            ],
            action: [
              {
                type: "keyword_action",
                priority: "high",
                action: "Do keyword work",
                keyword: "seo tool",
              },
            ],
          },
        },
        {
          moduleKey: "review_analysis",
          flow: {
            insight: [{ type: "review_summary" }],
            priority: [
              { type: "review_issue", priority: "medium", clusterKey: "billing" },
            ],
            action: [
              {
                type: "review_action",
                priority: "medium",
                action: "Do review work",
                clusterKey: "billing",
              },
            ],
          },
        },
      ],
    },
    {},
  );

  assert.equal(result.moduleKey, "unified_workflow_layer");
  assert.equal(result.status, "completed");
  assert.equal(result.activeByDefault, true);
  assert.ok(result.flow);
  assert.equal(result.flow.input.moduleResults.length, 2);
  assert.ok(result.flow.priority.length >= 2);
  assert.ok(result.flow.action.length >= 2);
  assert.equal(result.flow.priority[0].moduleKey, "keyword_analysis");
  assert.equal(result.flow.action[0].priority, "high");
}

async function testAdapterFallbackProvidesModuleResults() {
  const result = await runUnifiedWorkflowLayer(
    {
      appId: "com.example.app",
    },
    {
      integrationOverrides: {
        unified_workflow_layer: {
          async collect() {
            return {
              status: "adapter_supplied",
              moduleResults: [
                {
                  moduleKey: "optimization_layer",
                  flow: {
                    insight: [{ type: "optimization_gap" }],
                    priority: [
                      {
                        type: "optimization_gap",
                        priority: "medium",
                        sectionRef: "section_1",
                      },
                    ],
                    action: [
                      {
                        type: "optimization_action",
                        priority: "medium",
                        action: "Improve section",
                        sectionRef: "section_1",
                      },
                    ],
                  },
                },
              ],
            };
          },
        },
      },
    },
  );

  assert.equal(result.integrationStatus, "adapter_supplied");
  assert.equal(result.flow.input.moduleResults.length, 1);
  assert.ok(result.flow.action.length >= 1);
}

async function testQueryBackedPersistencePath() {
  const queries = [];

  const result = await runUnifiedWorkflowLayer(
    {
      websiteUrl: "https://example.com",
      moduleResults: [
        {
          moduleKey: "keyword_analysis",
          flow: {
            insight: [{ type: "keyword_summary" }],
            priority: [{ type: "high_keyword", priority: "high", keyword: "seo tool" }],
            action: [
              {
                type: "keyword_action",
                priority: "high",
                action: "Do keyword work",
                keyword: "seo tool",
              },
            ],
          },
        },
      ],
    },
    {
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (queries.length === 1) {
          return { rows: [{ id: 71 }] };
        }

        return { rows: [{ id: 96 }] };
      },
    },
  );

  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /insert into app_public\.product_targets/i);
  assert.match(queries[1].sql, /insert into app_public\.unified_workflow_layer_records/i);
  assert.equal(queries[0].params[0], "website");
  assert.equal(queries[0].params[1], "https://example.com");
  assert.equal(queries[1].params[1], "internal_only");
  assert.ok(result.flow.action.length >= 1);
}

function testUnifiedWorkflowIsActiveByDefault() {
  const activationState = getDefaultActivationState();
  assert.equal(activationState.unified_workflow_layer, true);
}

async function run() {
  testUnifiedWorkflowIsActiveByDefault();
  await testUnifiedWorkflowProducesOrderedCrossModuleActions();
  await testAdapterFallbackProvidesModuleResults();
  await testQueryBackedPersistencePath();
  console.log("unified-workflow-layer tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
