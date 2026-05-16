const { randomUUID } = require("node:crypto");

const INTENT_TAXONOMY = Object.freeze([
  "informational",
  "navigational",
  "commercial",
  "transactional",
  "local",
  "comparison",
  "investigative",
]);

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function createQueryRecord({
  query,
  location = null,
  language = null,
}) {
  return {
    id: randomUUID(),
    query: normalizeText(query),
    normalizedQuery: normalizeText(query).toLowerCase(),
    location: normalizeText(location) || null,
    language: normalizeText(language) || null,
    createdAt: new Date().toISOString(),
  };
}

function createIntentRecord({
  queryId,
  intent,
  confidence,
  rationale,
}) {
  return {
    id: randomUUID(),
    queryId,
    intent,
    confidence,
    rationale: normalizeText(rationale),
    createdAt: new Date().toISOString(),
  };
}

function createSerpPatternRecord({
  providerKey,
  availabilityStatus,
  aiOverviewDetected = null,
  featuredSnippetDetected = null,
  localIntentDetected = null,
  featureOwnership = [],
  rawPayload = null,
}) {
  return {
    id: randomUUID(),
    providerKey: normalizeText(providerKey),
    availabilityStatus,
    aiOverviewDetected,
    featuredSnippetDetected,
    localIntentDetected,
    featureOwnership,
    rawPayload,
    createdAt: new Date().toISOString(),
  };
}

function createCompetitorResultRecord({
  domain,
  rank = null,
  resultType = "organic",
}) {
  return {
    id: randomUUID(),
    domain: normalizeText(domain),
    rank: rank === null || rank === undefined ? null : Number(rank),
    resultType: normalizeText(resultType) || "organic",
  };
}

function createOpportunityScoreRecord({
  score,
  confidence,
  factors = [],
  rationale,
}) {
  return {
    id: randomUUID(),
    score,
    confidence,
    factors,
    rationale: normalizeText(rationale),
  };
}

function createVolatilityRecord({
  status,
  confidence,
  rationale,
}) {
  return {
    id: randomUUID(),
    status,
    confidence,
    rationale: normalizeText(rationale),
  };
}

function createSerpFeatureRecord({
  featureType,
  owned = false,
  available = true,
}) {
  return {
    id: randomUUID(),
    featureType: normalizeText(featureType),
    owned: Boolean(owned),
    available: Boolean(available),
  };
}

module.exports = {
  INTENT_TAXONOMY,
  createCompetitorResultRecord,
  createIntentRecord,
  createOpportunityScoreRecord,
  createQueryRecord,
  createSerpFeatureRecord,
  createSerpPatternRecord,
  createVolatilityRecord,
};
