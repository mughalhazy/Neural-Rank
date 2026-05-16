function normalizeNullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.max(0, Math.min(100, numericValue));
}

function mapGovernanceClassificationToRisk(governanceResult = null) {
  const classification = governanceResult?.overallClassification || "allow";

  if (classification === "block") {
    return 100;
  }

  if (classification === "require_approval") {
    return 75;
  }

  if (classification === "warn") {
    return 40;
  }

  return 10;
}

function derivePriorityLabel(overallScore) {
  if (overallScore >= 70) {
    return "high";
  }

  if (overallScore >= 40) {
    return "medium";
  }

  return "low";
}

function createRecommendationScore({
  severity = null,
  trafficImpact = null,
  conversionImpact = null,
  implementationDifficulty = null,
  confidence = null,
  governanceRisk = null,
  businessValue = null,
  expectedEffort = null,
  reversibility = null,
  rationale = "",
  governanceResult = null,
} = {}) {
  const dimensions = {
    severity: normalizeNullableNumber(severity),
    trafficImpact: normalizeNullableNumber(trafficImpact),
    conversionImpact: normalizeNullableNumber(conversionImpact),
    implementationDifficulty: normalizeNullableNumber(implementationDifficulty),
    confidence: normalizeNullableNumber(confidence),
    governanceRisk:
      normalizeNullableNumber(governanceRisk) ?? mapGovernanceClassificationToRisk(governanceResult),
    businessValue: normalizeNullableNumber(businessValue),
    expectedEffort: normalizeNullableNumber(expectedEffort),
    reversibility: normalizeNullableNumber(reversibility),
  };

  const missingInputs = Object.entries(dimensions)
    .filter(([, value]) => value === null)
    .map(([key]) => key);

  const effectiveConfidenceBase = dimensions.confidence ?? 50;
  const confidencePenalty = Math.min(missingInputs.length * 5, 30);
  const effectiveConfidence = Math.max(10, effectiveConfidenceBase - confidencePenalty);

  const positiveScore =
    (dimensions.severity ?? 50) * 0.23 +
    (dimensions.trafficImpact ?? 50) * 0.18 +
    (dimensions.conversionImpact ?? 50) * 0.18 +
    (dimensions.businessValue ?? 50) * 0.16 +
    effectiveConfidence * 0.15 +
    ((dimensions.reversibility ?? 50)) * 0.1;

  const negativeScore =
    (dimensions.implementationDifficulty ?? 50) * 0.1 +
    (dimensions.expectedEffort ?? 50) * 0.08 +
    (dimensions.governanceRisk ?? 10) * 0.12;

  const overallScore = Math.max(0, Math.min(100, Math.round(positiveScore - negativeScore + 15)));
  const derivedPriority = derivePriorityLabel(overallScore);

  const rationaleParts = [];
  if (rationale) {
    rationaleParts.push(String(rationale).trim());
  }
  if (missingInputs.length > 0) {
    rationaleParts.push(`Confidence reduced because inputs are unknown for: ${missingInputs.join(", ")}.`);
  }
  if (governanceResult?.overallClassification) {
    rationaleParts.push(`Governance classification: ${governanceResult.overallClassification}.`);
  }

  return {
    dimensions: {
      ...dimensions,
      confidence: effectiveConfidence,
    },
    overallScore,
    derivedPriority,
    rationale: rationaleParts.join(" ").trim(),
    missingInputs,
  };
}

module.exports = {
  createRecommendationScore,
  derivePriorityLabel,
  mapGovernanceClassificationToRisk,
};
