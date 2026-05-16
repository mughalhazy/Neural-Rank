const assert = require("node:assert/strict");

const {
  createSearchIntelligenceService,
} = require("./domains/search-intelligence/service");

async function testIntentClassificationReturnsConfidence() {
  const service = createSearchIntelligenceService();
  const result = await service.classifyIntent({
    query: "best seo platform pricing",
    language: "en",
  });

  assert.equal(result.query.query, "best seo platform pricing");
  assert.equal(result.intent.intent, "comparison");
  assert.ok(result.intent.confidence > 0.7);
  assert.equal(typeof result.intent.rationale, "string");
}

async function testProviderUnavailableIsExplicit() {
  const service = createSearchIntelligenceService();
  const result = await service.analyzeQuery({
    query: "seo platform for agencies",
    currentPosition: 24,
    searchVolume: 1200,
    difficulty: 35,
  });

  assert.equal(result.providerStatus, "provider_unavailable");
  assert.equal(result.serp.availabilityStatus, "provider_unavailable");
  assert.equal(result.competitorResults.length, 0);
  assert.equal(result.opportunity.confidence, 0.52);
  assert.equal(result.volatility.status, "provider_unavailable");
}

async function testProviderBasedSerpDataIsNotHardcoded() {
  const service = createSearchIntelligenceService();
  const provider = {
    providerKey: "approved_serp_provider",
    async fetchSerpData() {
      return {
        status: "available",
        aiOverviewDetected: true,
        featuredSnippetDetected: true,
        localIntentDetected: false,
        featureOwnership: [
          { featureType: "featured_snippet", owned: false, available: true },
        ],
        competitorResults: [
          { domain: "example-competitor.com", rank: 1, resultType: "organic" },
        ],
        rawPayload: { sample: true },
      };
    },
  };

  const result = await service.analyzeQuery(
    {
      query: "seo tool alternatives",
      currentPosition: 17,
      searchVolume: 800,
      difficulty: 22,
    },
    {
      serpProvider: provider,
    },
  );

  assert.equal(result.providerStatus, "available");
  assert.equal(result.serp.providerKey, "approved_serp_provider");
  assert.equal(result.serp.aiOverviewDetected, true);
  assert.equal(result.serp.featuredSnippetDetected, true);
  assert.equal(result.competitorResults.length, 1);
  assert.ok(result.opportunity.score >= 0);
  assert.ok(result.opportunity.score <= 100);
  assert.ok(result.opportunity.confidence > 0.6);
}

async function run() {
  await testIntentClassificationReturnsConfidence();
  await testProviderUnavailableIsExplicit();
  await testProviderBasedSerpDataIsNotHardcoded();
  console.log("search-intelligence tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
