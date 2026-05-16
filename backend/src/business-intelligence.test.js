const assert = require("node:assert/strict");

const {
  createBusinessIntelligenceService,
  resetBusinessIntelligenceState,
} = require("./domains/business-intelligence/service");
const {
  orderPriorityEntries,
} = require("./core/prioritization");

async function testManualBusinessProfilePreservesUnknowns() {
  resetBusinessIntelligenceState();
  const service = createBusinessIntelligenceService();

  const profile = await service.createBusinessProfile({
    businessObjective: "Increase demo requests",
    target: {
      websiteUrl: "https://example.com",
    },
    targetPage: "/pricing",
    funnelStage: "decision",
    leadRevenueRelevance: null,
    conversionRisk: null,
    contentRoiScore: null,
    targetPageValue: null,
    highValueKeywords: ["seo pricing", "rank tracking pricing"],
    notes: "Business owner has not supplied revenue values yet.",
  });

  assert.equal(profile.businessObjective, "Increase demo requests");
  assert.equal(profile.targetPage, "/pricing");
  assert.equal(profile.funnelStage, "decision");
  assert.equal(profile.leadRevenueRelevance, null);
  assert.equal(profile.conversionRisk, null);
  assert.equal(profile.contentRoiScore, null);
  assert.equal(profile.targetPageValue, null);
  assert.deepEqual(profile.highValueKeywords, ["seo pricing", "rank tracking pricing"]);
}

async function testBusinessValueExtendsPriorityOnlyWhenEvidenceExists() {
  resetBusinessIntelligenceState();
  const service = createBusinessIntelligenceService();

  const highValueProfile = await service.createBusinessProfile({
    businessObjective: "Increase enterprise pipeline",
    target: {
      websiteUrl: "https://example.com",
    },
    targetPage: "/enterprise",
    funnelStage: "decision",
    leadRevenueRelevance: 92,
    conversionRisk: 80,
    contentRoiScore: null,
    targetPageValue: 95,
    highValueKeywords: ["enterprise seo platform"],
  });

  const unknownValueProfile = await service.createBusinessProfile({
    businessObjective: "Support awareness content",
    target: {
      websiteUrl: "https://example.com",
    },
    targetPage: "/blog/seo-guide",
    funnelStage: "awareness",
    leadRevenueRelevance: null,
    conversionRisk: null,
    contentRoiScore: null,
    targetPageValue: null,
    highValueKeywords: ["seo guide"],
  });

  const highPriorityExtension = service.extendPriorityWithBusinessValue(
    {
      severity: 80,
      trafficImpact: 70,
      implementationDifficulty: 40,
      confidence: 0.8,
    },
    highValueProfile,
  );

  const unknownPriorityExtension = service.extendPriorityWithBusinessValue(
    {
      severity: 80,
      trafficImpact: 70,
      implementationDifficulty: 40,
      confidence: 0.8,
    },
    unknownValueProfile,
  );

  assert.equal(highPriorityExtension.businessValue, 95);
  assert.equal(highPriorityExtension.conversionImpact, 80);
  assert.equal(unknownPriorityExtension.businessValue, null);
  assert.equal(unknownPriorityExtension.conversionImpact, null);

  const ordered = orderPriorityEntries([
    {
      moduleKey: "keyword_analysis",
      type: "keyword_opportunity",
      keyword: "enterprise seo platform",
      priority: "high",
      businessValue: unknownPriorityExtension.businessValue,
    },
    {
      moduleKey: "keyword_analysis",
      type: "keyword_opportunity",
      keyword: "enterprise seo pricing",
      priority: "high",
      businessValue: highPriorityExtension.businessValue,
    },
  ]);

  assert.equal(ordered[0].keyword, "enterprise seo pricing");
  assert.equal(ordered[0].businessValue, 95);
}

async function run() {
  await testManualBusinessProfilePreservesUnknowns();
  await testBusinessValueExtendsPriorityOnlyWhenEvidenceExists();
  console.log("business-intelligence tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
