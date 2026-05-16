const POSITION_CTR_MAP = Object.freeze({
  0: 0.28,
  1: 0.28,
  2: 0.15,
  3: 0.11,
  4: 0.08,
  5: 0.07,
  6: 0.05,
  7: 0.04,
  8: 0.03,
  9: 0.03,
  10: 0.02,
});

const CONTENT_DEPTH_THRESHOLDS = Object.freeze({
  authoritative: 3000,
  comprehensive: 1500,
  moderate: 800,
  thin: 400,
});

const READABILITY_THRESHOLDS = Object.freeze({
  accessible: 15,
  moderate: 22,
});

function expectedCtrByPosition(position) {
  const pos = Math.max(0, Math.round(Number(position) || 0));
  if (pos in POSITION_CTR_MAP) {
    return POSITION_CTR_MAP[pos];
  }
  if (pos > 10 && pos <= 20) {
    return 0.01;
  }
  return 0;
}

function ctrEfficiencyScore(actualCtr, position) {
  const expected = expectedCtrByPosition(position);
  if (expected === 0) {
    return 0;
  }
  const actual = Math.max(0, Number(actualCtr) || 0);
  return Math.round((actual / expected) * 100) / 100;
}

function ctrOpportunityLift(actualCtr, position, impressions) {
  const expected = expectedCtrByPosition(position);
  const actual = Math.max(0, Number(actualCtr) || 0);
  const imp = Math.max(0, Number(impressions) || 0);
  const gap = Math.max(0, expected - actual);
  return Math.round(gap * imp);
}

function contentDepthTier(wordCount) {
  const count = Math.max(0, Number(wordCount) || 0);
  if (count >= CONTENT_DEPTH_THRESHOLDS.authoritative) {
    return "authoritative";
  }
  if (count >= CONTENT_DEPTH_THRESHOLDS.comprehensive) {
    return "comprehensive";
  }
  if (count >= CONTENT_DEPTH_THRESHOLDS.moderate) {
    return "moderate";
  }
  if (count >= CONTENT_DEPTH_THRESHOLDS.thin) {
    return "thin";
  }
  return "very_thin";
}

function readabilityTier(avgSentenceLength) {
  const length = Math.max(0, Number(avgSentenceLength) || 0);
  if (length <= READABILITY_THRESHOLDS.accessible) {
    return "accessible";
  }
  if (length <= READABILITY_THRESHOLDS.moderate) {
    return "moderate";
  }
  return "complex";
}

function estimateAvgSentenceLength(text) {
  if (!text || typeof text !== "string") {
    return 0;
  }
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) {
    return 0;
  }
  const totalWords = sentences.reduce((sum, s) => {
    return sum + s.trim().split(/\s+/).filter(Boolean).length;
  }, 0);
  return Math.round(totalWords / sentences.length);
}

function keywordDensity(text, keyword) {
  if (!text || !keyword) {
    return 0;
  }
  const words = String(text).toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return 0;
  }
  const kw = String(keyword).toLowerCase();
  const matches = words.filter((w) => w.includes(kw)).length;
  return Math.round((matches / words.length) * 1000) / 10;
}

function normalizeScore(value, min, max) {
  if (max === min) {
    return 0;
  }
  return Math.round(((value - min) / (max - min)) * 100);
}

module.exports = {
  CONTENT_DEPTH_THRESHOLDS,
  POSITION_CTR_MAP,
  READABILITY_THRESHOLDS,
  ctrEfficiencyScore,
  ctrOpportunityLift,
  contentDepthTier,
  estimateAvgSentenceLength,
  expectedCtrByPosition,
  keywordDensity,
  normalizeScore,
  readabilityTier,
};
