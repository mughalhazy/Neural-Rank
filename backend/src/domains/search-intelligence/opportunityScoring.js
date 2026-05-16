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

module.exports = {
  calculateOpportunityScore,
};
