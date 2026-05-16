const assert = require("node:assert/strict");

const backend = require("./index");

function buildModuleInputs() {
  return {
    review_analysis: {
      websiteUrl: "https://example.com",
      reviews: [
        { rating: 1, text: "slow crashes billing broken refund issue" },
      ],
    },
    content_listing_insights: {
      websiteUrl: "https://example.com",
      pageTitle: "SEO platform for growth teams",
      metaDescription: "",
      headings: ["Track rankings faster"],
      bodyText: "Short body",
      targetKeywords: ["seo", "rank tracking", "aso"],
    },
    keyword_analysis: {
      websiteUrl: "https://example.com",
      keywords: [
        { keyword: "seo tool", position: 25, difficulty: 18, volume: 1200 },
        { keyword: "aso platform", position: 42, difficulty: 14, volume: 900 },
      ],
    },
    rank_tracking: {
      websiteUrl: "https://example.com",
      rankEntries: [
        { keyword: "seo tool", currentRank: 20, previousRank: 8 },
        { keyword: "aso tool", currentRank: 11, previousRank: 25 },
      ],
    },
    competitor_analysis: {
      websiteUrl: "https://example.com",
      competitors: [
        {
          name: "Comp A",
          keywordCoverageScore: 80,
          contentCoverageScore: 70,
          rankVisibilityScore: 90,
          reviewSignalScore: 60,
        },
      ],
      targetKeywordCoverageScore: 50,
      targetContentCoverageScore: 45,
      targetRankVisibilityScore: 50,
      targetReviewSignalScore: 25,
    },
    optimization_layer: {
      websiteUrl: "https://example.com",
      sections: [
        {
          title: "SEO platform",
          content: "Short body",
          metadata: { title: "", description: "" },
        },
      ],
      targetKeywords: ["seo", "rank tracking", "aso"],
    },
    creative_messaging_layer: {
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
    technical_seo_audit: {
      websiteUrl: "https://example.com",
      url: "https://example.com",
      crawlData: [
        { url: "https://example.com/broken", statusCode: 404 },
        { url: "https://example.com/redirect-chain", statusCode: 301 },
      ],
      pageSpeedData: { lcp: 4800, cls: 0.28, inp: 580 },
    },
    on_page_seo_scorer: {
      websiteUrl: "https://example.com",
      pages: [
        {
          url: "https://example.com/features",
          title: "Feat",
          metaDescription: "",
          h1: "",
          bodyContent: "seo seo seo seo seo seo seo seo seo seo seo platform",
          targetKeywords: ["seo platform"],
          wordCount: 60,
        },
      ],
    },
    backlink_intelligence: {
      websiteUrl: "https://example.com",
      domain: "example.com",
      targetDA: 18,
      backlinks: [
        { sourceUrl: "https://low.site/link", domainAuthority: 5, anchorText: "click here", spamScore: 65 },
        { sourceUrl: "https://auth.org/post", domainAuthority: 60, anchorText: "seo platform" },
      ],
      referringDomains: [
        { domain: "low.site", domainAuthority: 5 },
        { domain: "auth.org", domainAuthority: 60 },
      ],
      competitorBacklinks: [{ domain: "techcrunch.com", domainAuthority: 90 }],
    },
    eeat_signals: {
      websiteUrl: "https://example.com",
      pages: [
        {
          url: "https://example.com/guide",
          hasAuthorBio: false,
          authorCredentials: [],
          hasByline: false,
          bodyContent: "This guide covers SEO basics.",
        },
      ],
      aboutPage: { exists: true, wordCount: 150, hasTeamSection: false, hasCompanyHistory: false },
      contactPage: { exists: false, hasAddress: false, hasPhone: false, hasEmail: false },
      trustSignals: [],
    },
    search_intent_classifier: {
      websiteUrl: "https://example.com",
      keywords: [
        { keyword: "buy seo software", existingContentType: "blog" },
        { keyword: "how to improve seo", existingContentType: "product" },
      ],
    },
    serp_feature_analyzer: {
      websiteUrl: "https://example.com",
      serpEntries: [
        {
          keyword: "seo platform reviews",
          featuresPresent: ["featured_snippet", "people_also_ask"],
          featuresOwned: [],
          position: 8,
        },
      ],
    },
    topical_authority: {
      websiteUrl: "https://example.com",
      targetTopics: [
        { topicKey: "seo", subtopics: ["technical seo", "on-page seo", "link building"] },
      ],
      existingContent: [
        { url: "https://example.com/blog/technical-seo", topicKey: "seo", subtopicKey: "technical seo", wordCount: 800, hasSchema: false },
      ],
      competitorTopics: [
        { competitorRef: "rival.com", topics: ["seo", "ppc", "analytics", "content marketing"] },
      ],
    },
    site_architecture: {
      websiteUrl: "https://example.com",
      pages: [
        { url: "https://example.com/", depth: 1, inboundInternalLinks: 0, outboundInternalLinks: 8, wordCount: 400 },
        { url: "https://example.com/deep/very/nested/page", depth: 5, inboundInternalLinks: 0, outboundInternalLinks: 1, wordCount: 200 },
        { url: "https://example.com/orphan", depth: 3, inboundInternalLinks: 0, outboundInternalLinks: 0, wordCount: 150 },
      ],
    },
    analytics_integration: {
      websiteUrl: "https://example.com",
      gscData: {
        searchAnalytics: [
          { query: "seo platform", clicks: 4, impressions: 2400, ctr: 0.0017, position: 5.2 },
          { query: "rank tracker", clicks: 1, impressions: 800, ctr: 0.00125, position: 16.3 },
        ],
        indexCoverage: { validIndexed: 220, warnings: 15, errors: 6, excluded: 10 },
        crawlErrors: [{ url: "https://example.com/gone", type: "not_found", statusCode: 404 }],
        coreWebVitals: {},
      },
      ga4Data: {
        pageMetrics: [
          { url: "https://example.com/features", organicSessions: 500, organicSessionsPrev: 820, conversions: 0, bounceRate: 0.62 },
        ],
        totalOrganicSessions: 500,
      },
    },
    local_seo: {
      websiteUrl: "https://example.com",
      businessName: "Example SEO Agency",
      citations: [{ source: "yelp", name: "Example SEO Agency", address: "123 Main St", phone: "+1-555-000-0000" }],
      localKeywords: [{ keyword: "seo agency nyc", localPackPosition: null, organicPosition: 20 }],
    },
    unified_workflow_layer: {
      websiteUrl: "https://example.com",
    },
  };
}

function assertFlowShape(moduleKey, result) {
  assert.equal(result.status, "completed", `${moduleKey} should complete`);
  assert.ok(result.flow, `${moduleKey} should expose flow`);
  assert.ok("input" in result.flow, `${moduleKey} should expose flow.input`);
  assert.ok("analysis" in result.flow, `${moduleKey} should expose flow.analysis`);
  assert.ok(Array.isArray(result.flow.insight), `${moduleKey} should expose flow.insight`);
  assert.ok(Array.isArray(result.flow.priority), `${moduleKey} should expose flow.priority`);
  assert.ok(Array.isArray(result.flow.action), `${moduleKey} should expose flow.action`);
  assert.ok(result.flow.action.length >= 1, `${moduleKey} should expose at least one action`);
}

function testDefaultActivationState() {
  const activationState = backend.getDefaultActivationState();
  const grouped = backend.listModulesByActivation();

  assert.equal(Object.keys(activationState).length, 18);
  assert.equal(grouped.active.length, 17);
  assert.equal(grouped.inactive.length, 0);
  assert.equal(activationState.local_seo, false);
  assert.equal(activationState.unified_workflow_layer, true);
}

async function testDefaultOrchestrationAndFlowContracts() {
  const result = await backend.runDefaultBackendFlow(buildModuleInputs(), {});
  const moduleKeys = Object.keys(result.results);

  assert.equal(moduleKeys.length, 17);
  moduleKeys.forEach((moduleKey) => assertFlowShape(moduleKey, result.results[moduleKey]));
  assert.equal(result.results.unified_workflow_layer.flow.input.moduleResults.length, 16);
}

async function testActivationAwareFlowStillSupportsExplicitOverridesWithoutBreakingDefaults() {
  const result = await backend.runActivationAwareFlow(
    buildModuleInputs(),
    {},
    { unified_workflow_layer: true },
    {},
  );

  assert.equal(Object.keys(result.results).length, 17);
  assertFlowShape("unified_workflow_layer", result.results.unified_workflow_layer);
}

async function testIntegrationBoundaryTransparency() {
  const reviewResult = await backend.getModuleService("review_analysis").run(
    { appId: "com.example.app" },
    {},
  );

  assert.equal(reviewResult.integrationStatus, "integration_incomplete");
  assert.equal(reviewResult.flow.input.reviews.length, 0);
  assert.ok(reviewResult.flow.action.length >= 1);
}

async function testCrossModulePrioritizationOrdering() {
  const result = await backend.getModuleService("unified_workflow_layer").run(
    {
      websiteUrl: "https://example.com",
      moduleResults: [
        {
          moduleKey: "keyword_analysis",
          flow: {
            insight: [{ type: "keyword_summary" }],
            priority: [{ type: "keyword", priority: "high", keyword: "seo tool" }],
            action: [{ type: "keyword_action", priority: "high", action: "Do keyword work", keyword: "seo tool" }],
          },
        },
        {
          moduleKey: "review_analysis",
          flow: {
            insight: [{ type: "review_summary" }],
            priority: [{ type: "review", priority: "medium", clusterKey: "billing" }],
            action: [{ type: "review_action", priority: "medium", action: "Do review work", clusterKey: "billing" }],
          },
        },
      ],
    },
    {},
  );

  assert.equal(result.flow.priority[0].priority, "high");
  assert.equal(result.flow.priority[0].moduleKey, "keyword_analysis");
  assert.equal(result.flow.action[0].priority, "high");
}

async function run() {
  testDefaultActivationState();
  await testDefaultOrchestrationAndFlowContracts();
  await testActivationAwareFlowStillSupportsExplicitOverridesWithoutBreakingDefaults();
  await testIntegrationBoundaryTransparency();
  await testCrossModulePrioritizationOrdering();
  console.log("shared-backend tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
