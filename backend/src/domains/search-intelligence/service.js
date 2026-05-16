const { searchIntelligenceContract } = require("./contract");
const {
  createKeywordAnalysisCompatibilityAdapter,
} = require("./adapters/keywordAnalysisAdapter");
const {
  createRankTrackingCompatibilityAdapter,
} = require("./adapters/rankTrackingAdapter");
const {
  createCompetitorAnalysisCompatibilityAdapter,
} = require("./adapters/competitorAnalysisAdapter");
const {
  createCompetitorResultRecord,
  createIntentRecord,
  createOpportunityScoreRecord,
  createQueryRecord,
  createSerpFeatureRecord,
  createSerpPatternRecord,
  createVolatilityRecord,
} = require("./models");
const { classifyQueryIntent } = require("./intentClassifier");
const { calculateOpportunityScore } = require("./opportunityScoring");
const { resolveSerpProvider } = require("./providerInterface");

async function classifyIntent(input = {}) {
  const query = createQueryRecord(input);
  const classification = classifyQueryIntent(query.query);
  const intent = createIntentRecord({
    queryId: query.id,
    intent: classification.intent,
    confidence: classification.confidence,
    rationale: classification.rationale,
  });

  return {
    query,
    intent,
  };
}

async function analyzeQuery(input = {}, context = {}) {
  const { query, intent } = await classifyIntent(input);
  const provider = resolveSerpProvider(context);
  const providerResult = await provider.fetchSerpData({
    query: query.query,
    location: query.location,
    language: query.language,
  });

  const serpPattern = createSerpPatternRecord({
    providerKey: provider.providerKey,
    availabilityStatus: providerResult.status,
    aiOverviewDetected: providerResult.aiOverviewDetected ?? null,
    featuredSnippetDetected: providerResult.featuredSnippetDetected ?? null,
    localIntentDetected: providerResult.localIntentDetected ?? (intent.intent === "local"),
    featureOwnership: Array.isArray(providerResult.featureOwnership)
      ? providerResult.featureOwnership.map((feature) =>
          createSerpFeatureRecord({
            featureType: feature.featureType,
            owned: feature.owned,
            available: feature.available !== false,
          }),
        )
      : [],
    rawPayload: providerResult.rawPayload ?? null,
  });

  const competitorResults = Array.isArray(providerResult.competitorResults)
    ? providerResult.competitorResults.map((result) =>
        createCompetitorResultRecord({
          domain: result.domain,
          rank: result.rank,
          resultType: result.resultType,
        }),
      )
    : [];

  const opportunity = createOpportunityScoreRecord(
    calculateOpportunityScore({
      intentConfidence: intent.confidence,
      providerAvailable: providerResult.status === "available",
      currentPosition: input.currentPosition ?? input.position ?? null,
      searchVolume: input.searchVolume ?? input.volume ?? null,
      difficulty: input.difficulty ?? null,
    }),
  );

  const volatility = createVolatilityRecord({
    status: providerResult.status === "available" ? "unknown" : "provider_unavailable",
    confidence: providerResult.status === "available" ? 0.4 : 0.95,
    rationale:
      providerResult.status === "available"
        ? "Volatility requires historical provider observations and is not yet fully modeled."
        : "Volatility is unavailable because no compliant SERP provider is connected.",
  });

  return {
    contract: searchIntelligenceContract,
    query,
    intent,
    serp: serpPattern,
    competitorResults,
    opportunity,
    volatility,
    providerStatus: providerResult.status,
  };
}

function createSearchIntelligenceService() {
  return {
    contract: searchIntelligenceContract,
    compatibilityAdapters: {
      keyword_analysis: createKeywordAnalysisCompatibilityAdapter(),
      rank_tracking: createRankTrackingCompatibilityAdapter(),
      competitor_analysis: createCompetitorAnalysisCompatibilityAdapter(),
    },
    classifyIntent,
    analyzeQuery,
  };
}

module.exports = {
  createSearchIntelligenceService,
};
