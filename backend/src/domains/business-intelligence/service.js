const { businessIntelligenceContract } = require("./contract");
const {
  createBusinessPriorityExtension,
  createBusinessProfileRecord,
} = require("./models");
const {
  createInMemoryBusinessIntelligenceRepository,
  createPostgresBusinessIntelligenceRepository,
} = require("./repository");

const defaultBusinessRepository = createInMemoryBusinessIntelligenceRepository();

function resolveRepository(context = {}) {
  if (context.businessIntelligenceRepository) {
    return context.businessIntelligenceRepository;
  }

  if (context.query || context.db?.query || context.pg?.query) {
    return createPostgresBusinessIntelligenceRepository(context);
  }

  return defaultBusinessRepository;
}

async function createBusinessProfile(input = {}, context = {}) {
  const repository = resolveRepository(context);
  const record = createBusinessProfileRecord(input);
  return repository.createBusinessProfile(record);
}

async function listBusinessProfiles(context = {}) {
  const repository = resolveRepository(context);
  return repository.listBusinessProfiles();
}

function extendPriorityWithBusinessValue(priorityInput = {}, businessProfile = null) {
  const businessValue = businessProfile?.targetPageValue ?? null;
  const leadRevenueRelevance = businessProfile?.leadRevenueRelevance ?? null;
  const conversionRisk = businessProfile?.conversionRisk ?? null;
  const contentRoiScore = businessProfile?.contentRoiScore ?? null;

  return createBusinessPriorityExtension({
    severity: priorityInput.severity ?? null,
    trafficImpact: priorityInput.trafficImpact ?? null,
    conversionImpact: conversionRisk,
    implementationDifficulty: priorityInput.implementationDifficulty ?? null,
    confidence: priorityInput.confidence ?? null,
    businessValue:
      businessValue !== null
        ? businessValue
        : leadRevenueRelevance !== null
          ? leadRevenueRelevance
          : contentRoiScore,
  });
}

function createBusinessIntelligenceService() {
  return {
    contract: businessIntelligenceContract,
    compatibilityAdapters: {},
    createBusinessProfile,
    listBusinessProfiles,
    extendPriorityWithBusinessValue,
  };
}

function resetBusinessIntelligenceState() {
  if (typeof defaultBusinessRepository.reset === "function") {
    defaultBusinessRepository.reset();
  }
}

module.exports = {
  createBusinessIntelligenceService,
  resetBusinessIntelligenceState,
};
