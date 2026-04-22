const MODULE_KEY = "rank_tracking";

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
    productTarget: {
      targetRef:
        normalizeText(inputPayload.targetRef) ||
        normalizeText(inputPayload.websiteUrl) ||
        normalizeText(inputPayload.appUrl) ||
        normalizeText(inputPayload.appId) ||
        "unknown_target",
      targetType:
        normalizeText(inputPayload.targetType) ||
        (normalizeText(inputPayload.appUrl) || normalizeText(inputPayload.appId)
          ? "app_target"
          : "product_target"),
      websiteUrl: normalizeText(inputPayload.websiteUrl) || null,
      appId: normalizeText(inputPayload.appId) || null,
      appStoreUrl: normalizeText(inputPayload.appUrl) || normalizeText(inputPayload.appStoreUrl) || null,
      playStoreUrl: normalizeText(inputPayload.playStoreUrl) || null,
    },
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

    return {
      keyword: entry.keyword,
      currentPosition: entry.currentPosition,
      previousPosition: entry.previousPosition,
      movementType: movement.movementType,
      delta: movement.delta,
    };
  });

  return {
    normalizedInput,
    movementDetails,
    ...summarize(movementDetails),
  };
}

module.exports = {
  MODULE_KEY,
  analyzeRankInput,
  normalizeRankInput,
};
