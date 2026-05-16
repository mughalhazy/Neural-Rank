const { INTENT_TAXONOMY } = require("./models");

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase();
}

const INTENT_RULES = [
  {
    intent: "local",
    phrases: ["near me", "nearby", "in karachi", "in lahore", "open now", "local"],
    confidence: 0.86,
    rationale: "Local modifiers signal location-sensitive intent.",
  },
  {
    intent: "comparison",
    phrases: ["vs", "versus", "compare", "alternative", "best", "top"],
    confidence: 0.84,
    rationale: "Comparison terms signal evaluation across options.",
  },
  {
    intent: "transactional",
    phrases: ["buy", "pricing", "price", "subscribe", "sign up", "trial", "book", "order"],
    confidence: 0.88,
    rationale: "Purchase or signup terms signal transactional intent.",
  },
  {
    intent: "commercial",
    phrases: ["software", "tool", "platform", "service", "agency", "solution"],
    confidence: 0.74,
    rationale: "Product-discovery terms suggest commercial research intent.",
  },
  {
    intent: "investigative",
    phrases: ["review", "reviews", "worth it", "legit", "case study", "outcomes"],
    confidence: 0.78,
    rationale: "Validation or proof-seeking terms indicate investigative intent.",
  },
  {
    intent: "navigational",
    phrases: ["login", "docs", "dashboard", "homepage", "official", "app"],
    confidence: 0.76,
    rationale: "Branded destination terms indicate navigational intent.",
  },
  {
    intent: "informational",
    phrases: ["what is", "how to", "guide", "tips", "meaning", "why", "learn"],
    confidence: 0.8,
    rationale: "Question and learning phrases indicate informational intent.",
  },
];

function classifyQueryIntent(query = "") {
  const normalizedQuery = normalizeText(query);

  for (const rule of INTENT_RULES) {
    if (rule.phrases.some((phrase) => normalizedQuery.includes(phrase))) {
      return {
        intent: rule.intent,
        confidence: rule.confidence,
        rationale: rule.rationale,
      };
    }
  }

  const fallbackIntent = normalizedQuery.split(/\s+/).length <= 2
    ? "commercial"
    : "informational";

  return {
    intent: fallbackIntent,
    confidence: 0.55,
    rationale: "Heuristic fallback used because no stronger intent phrases matched.",
  };
}

function assertIntentTaxonomy(intent) {
  if (!INTENT_TAXONOMY.includes(intent)) {
    throw new Error("invalid_search_intent");
  }
}

module.exports = {
  assertIntentTaxonomy,
  classifyQueryIntent,
};
