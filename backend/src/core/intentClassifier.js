const INTENT_SIGNALS = Object.freeze({
  informational: [
    "how", "what", "why", "when", "where", "who", "which",
    "guide", "tutorial", "examples", "tips", "learn", "understand",
    "definition", "meaning", "explain", "overview", "introduction",
    "beginner", "basics", "history", "difference", "list",
  ],
  navigational: [
    "login", "sign in", "sign up", "account", "dashboard",
    "app", "website", "official", "download", "portal", "platform",
    "coupon", "promo",
  ],
  transactional: [
    "buy", "price", "pricing", "cost", "discount", "free trial",
    "download", "get", "order", "subscribe", "deal", "cheap",
    "affordable", "hire", "book", "register", "install", "start",
    "free", "trial", "demo", "quote",
  ],
  commercial: [
    "best", "top", "review", "reviews", "compare", "vs", "versus",
    "alternative", "alternatives", "comparison", "rated", "recommend",
    "ranking", "pros cons", "worth", "should i", "which is better",
  ],
});

const CONTENT_FORMAT_MAP = Object.freeze({
  informational: ["blog post", "guide", "FAQ page", "glossary entry", "how-to article"],
  navigational: ["landing page", "feature page", "brand page", "login page"],
  transactional: ["product page", "pricing page", "CTA-heavy landing page", "sign-up page"],
  commercial: ["comparison page", "review article", "listicle", "roundup", "vs page"],
});

const INTENT_KEYS = Object.keys(INTENT_SIGNALS);

function tokenize(keyword) {
  return String(keyword || "")
    .toLowerCase()
    .split(/[\s\-_/]+/)
    .filter(Boolean);
}

function scoreIntent(tokens) {
  const scores = {};

  for (const intentKey of INTENT_KEYS) {
    const signals = INTENT_SIGNALS[intentKey];
    let score = 0;

    for (const token of tokens) {
      for (const signal of signals) {
        if (signal.includes(" ")) {
          const joined = tokens.join(" ");
          if (joined.includes(signal)) {
            score += 2;
          }
        } else if (token === signal) {
          score += 1;
        }
      }
    }

    scores[intentKey] = score;
  }

  return scores;
}

function classifyIntent(keyword) {
  if (!keyword || typeof keyword !== "string") {
    return {
      primaryIntent: "informational",
      confidence: 0,
      recommendedFormats: CONTENT_FORMAT_MAP.informational,
      scores: { informational: 0, navigational: 0, transactional: 0, commercial: 0 },
    };
  }

  const tokens = tokenize(keyword);
  const scores = scoreIntent(tokens);
  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);

  let primaryIntent = "informational";
  let highestScore = -1;

  for (const intentKey of INTENT_KEYS) {
    if (scores[intentKey] > highestScore) {
      highestScore = scores[intentKey];
      primaryIntent = intentKey;
    }
  }

  const confidence = totalScore > 0 ? Math.round((highestScore / totalScore) * 100) / 100 : 0;

  return {
    primaryIntent,
    confidence,
    recommendedFormats: CONTENT_FORMAT_MAP[primaryIntent],
    scores,
  };
}

function batchClassifyIntents(keywords = []) {
  return keywords.map((entry) => {
    const keyword = typeof entry === "string" ? entry : entry?.keyword || "";
    const classification = classifyIntent(keyword);
    return {
      keyword,
      ...classification,
    };
  });
}

module.exports = {
  CONTENT_FORMAT_MAP,
  INTENT_SIGNALS,
  batchClassifyIntents,
  classifyIntent,
  tokenize,
};
