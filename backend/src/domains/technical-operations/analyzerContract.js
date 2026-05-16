const TECHNICAL_SEVERITIES = Object.freeze([
  "low",
  "medium",
  "high",
  "critical",
]);

const TECHNICAL_ANALYZER_KEYS = Object.freeze([
  "metadata",
  "headings",
  "canonical",
  "robots",
  "sitemap",
  "indexability",
  "internal_links",
  "duplicate_risk",
  "redirect_chain",
  "broken_links_assets",
  "rendered_dom",
]);

function createTechnicalFinding({
  analyzerKey,
  findingKey,
  severity,
  evidence = {},
  recommendedAction = {},
  governanceRisk = null,
  confidence = 0.5,
}) {
  if (!TECHNICAL_ANALYZER_KEYS.includes(analyzerKey)) {
    throw new Error("invalid_technical_analyzer_key");
  }

  if (!TECHNICAL_SEVERITIES.includes(severity)) {
    throw new Error("invalid_technical_severity");
  }

  return {
    analyzerKey,
    findingKey,
    severity,
    evidence,
    recommendedAction,
    governanceRisk,
    confidence,
  };
}

module.exports = {
  TECHNICAL_ANALYZER_KEYS,
  TECHNICAL_SEVERITIES,
  createTechnicalFinding,
};
