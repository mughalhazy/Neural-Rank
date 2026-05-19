function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function calculateOpportunityScore({
  intentConfidence = 0.5,
  providerAvailable = false,
  currentPosition = null,
  searchVolume = null,
  difficulty = null,
}) {
  let score = 40;
  const factors = [];

  score += clamp(intentConfidence * 20, 0, 20);
  factors.push({
    factor: "intent_confidence",
    contribution: clamp(intentConfidence * 20, 0, 20),
  });

  if (providerAvailable) {
    score += 10;
    factors.push({ factor: "provider_available", contribution: 10 });
  }

  if (currentPosition !== null && currentPosition !== undefined) {
    const positionBoost = currentPosition > 10 && currentPosition <= 40 ? 18 : currentPosition <= 10 ? 6 : 10;
    score += positionBoost;
    factors.push({ factor: "current_position", contribution: positionBoost });
  }

  if (searchVolume !== null && searchVolume !== undefined) {
    const volumeBoost = searchVolume >= 1000 ? 15 : searchVolume >= 200 ? 8 : 3;
    score += volumeBoost;
    factors.push({ factor: "search_volume", contribution: volumeBoost });
  }

  if (difficulty !== null && difficulty !== undefined) {
    const difficultyPenalty = difficulty >= 70 ? -14 : difficulty >= 40 ? -7 : 4;
    score += difficultyPenalty;
    factors.push({ factor: "difficulty", contribution: difficultyPenalty });
  }

  return {
    score: clamp(Math.round(score), 0, 100),
    confidence: providerAvailable ? 0.72 : 0.52,
    factors,
    rationale: providerAvailable
      ? "Opportunity score combines heuristic intent with provider-backed search context."
      : "Opportunity score is heuristic-only because no compliant SERP provider is connected.",
  };
}

// Derives SERP volatility from available signals — no external provider required.
// Returns { status, confidence, rationale, signals }.
// "unknown" is returned only when no signals are present, never by default.
function deriveVolatility(serpData = {}, historicalPositions = []) {
  const signals = [];

  const hasHistory = Array.isArray(historicalPositions) && historicalPositions.length >= 2;
  if (hasHistory) {
    const positions = historicalPositions.map((p) => Number(p)).filter(Number.isFinite);
    const min = Math.min(...positions);
    const max = Math.max(...positions);
    const variance = max - min;
    signals.push({ name: "position_variance", value: variance });

    if (variance > 10) {
      return {
        status: "high",
        confidence: 0.82,
        rationale: `Position variance of ${variance} positions across ${positions.length} observations indicates high SERP volatility.`,
        signals,
      };
    }
    if (variance >= 5) {
      return {
        status: "medium",
        confidence: 0.75,
        rationale: `Position variance of ${variance} positions across ${positions.length} observations indicates moderate SERP volatility.`,
        signals,
      };
    }
    return {
      status: "low",
      confidence: 0.80,
      rationale: `Position variance of ${variance} positions across ${positions.length} observations indicates stable rankings.`,
      signals,
    };
  }

  // Use SERP feature presence as a proxy for volatility when no history is available.
  const hasFeatureOwnership = Array.isArray(serpData.featureOwnership) && serpData.featureOwnership.length > 0;
  const hasFeaturedSnippet = serpData.featuredSnippetDetected === true;
  const hasAiOverview = serpData.aiOverviewDetected === true;

  if (hasFeaturedSnippet || hasAiOverview) {
    signals.push({ name: "serp_features_detected", value: true });
    return {
      status: "high",
      confidence: 0.60,
      rationale: "Featured snippets and AI overviews frequently reshuffle — indicates elevated volatility risk.",
      signals,
    };
  }

  if (hasFeatureOwnership) {
    signals.push({ name: "serp_feature_ownership", value: serpData.featureOwnership.length });
    return {
      status: "medium",
      confidence: 0.55,
      rationale: "SERP feature presence indicates moderate volatility; ownership may shift as Google experiments.",
      signals,
    };
  }

  return {
    status: "unknown",
    confidence: 0.30,
    rationale: "Insufficient signals to classify volatility — no historical position data and no SERP feature observations.",
    signals,
  };
}

module.exports = {
  calculateOpportunityScore,
  deriveVolatility,
};
