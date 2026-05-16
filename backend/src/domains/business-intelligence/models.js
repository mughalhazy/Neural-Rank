const { randomUUID } = require("node:crypto");
const { normalizeProductTarget, normalizeText } = require("../../core/targeting");

const FUNNEL_STAGES = Object.freeze([
  "awareness",
  "consideration",
  "decision",
  "retention",
]);

function normalizeNullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function createBusinessProfileRecord({
  businessObjective = null,
  target = {},
  targetPage = null,
  funnelStage = null,
  leadRevenueRelevance = null,
  conversionRisk = null,
  contentRoiScore = null,
  highValueKeywords = [],
  targetPageValue = null,
  notes = "",
}) {
  return {
    id: randomUUID(),
    businessObjective: normalizeText(businessObjective) || null,
    target: normalizeProductTarget(target),
    targetPage: normalizeText(targetPage) || null,
    funnelStage: normalizeText(funnelStage) || null,
    leadRevenueRelevance: normalizeNullableNumber(leadRevenueRelevance),
    conversionRisk: normalizeNullableNumber(conversionRisk),
    contentRoiScore: normalizeNullableNumber(contentRoiScore),
    targetPageValue: normalizeNullableNumber(targetPageValue),
    highValueKeywords: Array.isArray(highValueKeywords)
      ? highValueKeywords.map((keyword) => normalizeText(keyword)).filter(Boolean)
      : [],
    notes: normalizeText(notes),
    createdAt: new Date().toISOString(),
  };
}

function createBusinessPriorityExtension({
  severity = null,
  trafficImpact = null,
  conversionImpact = null,
  implementationDifficulty = null,
  confidence = null,
  businessValue = null,
}) {
  return {
    severity: normalizeNullableNumber(severity),
    trafficImpact: normalizeNullableNumber(trafficImpact),
    conversionImpact: normalizeNullableNumber(conversionImpact),
    implementationDifficulty: normalizeNullableNumber(implementationDifficulty),
    confidence: normalizeNullableNumber(confidence),
    businessValue: normalizeNullableNumber(businessValue),
  };
}

module.exports = {
  FUNNEL_STAGES,
  createBusinessPriorityExtension,
  createBusinessProfileRecord,
};
