const MODULE_KEY = "rank_tracking";
const { normalizeProductTarget } = require("../../core/targeting");
const { expectedCtrByPosition, ctrEfficiencyScore } = require("../../core/seoScorer");

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function toNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizeRankEntry(entry, index) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const keyword = normalizeText(entry.keyword || entry.term || entry.query).toLowerCase();
  const currentPosition = toNumber(
    entry.currentPosition ?? entry.currentRank ?? entry.position,
    null,
  );
  const previousPosition = toNumber(
    entry.previousPosition ?? entry.previousRank,
    null,
  );

  if (!keyword || currentPosition === null) {
    return null;
  }

  return {
    rankId: normalizeText(entry.rankId || entry.id) || `rank_${index + 1}`,
    keyword,
    currentPosition,
    previousPosition,
    clicks: toNumber(entry.clicks, null),
    impressions: toNumber(entry.impressions, null),
    ctr: toNumber(entry.ctr, null),
    rankingUrl: normalizeText(entry.rankingUrl ?? entry.url ?? ""),
  };
}

function normalizeRankInput(inputPayload = {}) {
  const directRanks = Array.isArray(inputPayload.rankEntries)
    ? inputPayload.rankEntries
    : Array.isArray(inputPayload.ranks)
      ? inputPayload.ranks
      : [];

  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(inputPayload),
    rankEntries: directRanks.map(normalizeRankEntry).filter(Boolean),
  };
}

function classifyMovement(previousPosition, currentPosition) {
  if (previousPosition === null) {
    return {
      movementType: "new_tracking",
      delta: 0,
    };
  }

  const delta = previousPosition - currentPosition;

  if (delta > 0) {
    return {
      movementType: "improved",
      delta,
    };
  }

  if (delta < 0) {
    return {
      movementType: "declined",
      delta,
    };
  }

  return {
    movementType: "unchanged",
    delta: 0,
  };
}

function summarize(movementDetails) {
  const improved = movementDetails.filter((entry) => entry.movementType === "improved");
  const declined = movementDetails.filter((entry) => entry.movementType === "declined");
  const unchanged = movementDetails.filter((entry) => entry.movementType === "unchanged");
  const newTracking = movementDetails.filter((entry) => entry.movementType === "new_tracking");

  return {
    rankEntryCount: movementDetails.length,
    improvedCount: improved.length,
    declinedCount: declined.length,
    unchangedCount: unchanged.length,
    newTrackingCount: newTracking.length,
    topImprovement: improved.sort((left, right) => right.delta - left.delta)[0] || null,
    topDecline:
      declined.sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))[0] || null,
  };
}

function analyzeRankInput(normalizedInput) {
  const movementDetails = normalizedInput.rankEntries.map((entry) => {
    const movement = classifyMovement(entry.previousPosition, entry.currentPosition);
    const isPositionZero = entry.currentPosition === 0;
    const isQuickWin = entry.currentPosition >= 11 && entry.currentPosition <= 20;

    const expectedCtr = expectedCtrByPosition(entry.currentPosition);
    const ctrEfficiency = entry.ctr !== null
      ? ctrEfficiencyScore(entry.ctr, entry.currentPosition)
      : null;
    const ctrUnderperforming = ctrEfficiency !== null && ctrEfficiency < 0.7;

    return {
      keyword: entry.keyword,
      currentPosition: entry.currentPosition,
      previousPosition: entry.previousPosition,
      movementType: movement.movementType,
      delta: movement.delta,
      clicks: entry.clicks,
      impressions: entry.impressions,
      ctr: entry.ctr,
      rankingUrl: entry.rankingUrl,
      expectedCtr,
      ctrEfficiency,
      ctrUnderperforming,
      isPositionZero,
      isQuickWin,
    };
  });

  const quickWinKeywords = movementDetails.filter((e) => e.isQuickWin);
  const ctrUnderperformers = movementDetails.filter((e) => e.ctrUnderperforming);
  const positionZeroEntries = movementDetails.filter((e) => e.isPositionZero);

  return {
    normalizedInput,
    movementDetails,
    quickWinKeywords,
    ctrUnderperformers,
    positionZeroEntries,
    ...summarize(movementDetails),
  };
}

module.exports = {
  MODULE_KEY,
  analyzeRankInput,
  normalizeRankInput,
};
