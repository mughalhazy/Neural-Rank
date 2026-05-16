const { normalizeProductTarget } = require("../../core/targeting");

const MODULE_KEY = "eeat_signals";

const YMYL_CATEGORIES = new Set([
  "health", "finance", "financial", "legal", "law", "medical", "news",
  "safety", "government", "investment", "insurance", "pharmacy",
]);

const FIRST_HAND_MARKERS = [
  "i found", "in my experience", "i tested", "we tested", "i tried",
  "our team", "in our study", "we found", "our research", "i recommend",
  "based on my", "from my experience",
];

const CITATION_MARKERS = [
  "according to", "study shows", "research shows", "data shows",
  "published in", "cited by", "source:", "references:", "per ",
];

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeEeatInput(inputPayload = {}) {
  const pages = Array.isArray(inputPayload.pages)
    ? inputPayload.pages.map((p) => ({
        url: String(p.url ?? ""),
        hasAuthorBio: Boolean(p.hasAuthorBio ?? p.has_author_bio),
        authorCredentials: Array.isArray(p.authorCredentials) ? p.authorCredentials : [],
        hasByline: Boolean(p.hasByline ?? p.has_byline),
        bodyContent: String(p.bodyContent ?? p.content ?? ""),
      }))
    : [];

  const aboutPage = inputPayload.aboutPage && typeof inputPayload.aboutPage === "object"
    ? {
        exists: Boolean(inputPayload.aboutPage.exists !== false),
        wordCount: toNumber(inputPayload.aboutPage.wordCount, 0),
        hasTeamSection: Boolean(inputPayload.aboutPage.hasTeamSection),
        hasCompanyHistory: Boolean(inputPayload.aboutPage.hasCompanyHistory),
      }
    : { exists: false, wordCount: 0, hasTeamSection: false, hasCompanyHistory: false };

  const contactPage = inputPayload.contactPage && typeof inputPayload.contactPage === "object"
    ? {
        exists: Boolean(inputPayload.contactPage.exists !== false),
        hasAddress: Boolean(inputPayload.contactPage.hasAddress),
        hasPhone: Boolean(inputPayload.contactPage.hasPhone),
        hasEmail: Boolean(inputPayload.contactPage.hasEmail),
      }
    : { exists: false, hasAddress: false, hasPhone: false, hasEmail: false };

  const trustSignals = Array.isArray(inputPayload.trustSignals)
    ? inputPayload.trustSignals.map((s) => ({
        type: String(s.type ?? ""),
        value: s.value ?? null,
      }))
    : [];

  const externalCitations = Array.isArray(inputPayload.externalCitations)
    ? inputPayload.externalCitations.map((c) => ({
        sourceUrl: String(c.sourceUrl ?? c.url ?? ""),
        sourceDomain: String(c.sourceDomain ?? c.domain ?? ""),
        domainAuthority: toNumber(c.domainAuthority ?? c.da, 0),
      }))
    : [];

  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(inputPayload),
    niche: String(inputPayload.niche ?? "").toLowerCase(),
    pages,
    aboutPage,
    contactPage,
    trustSignals,
    externalCitations,
  };
}

function scoreExperience(pages) {
  const totalPages = pages.length;
  if (totalPages === 0) return { experienceScore: 0, bylineRatio: 0, authorBioRatio: 0, firstHandSignals: 0 };

  const bylinePages = pages.filter((p) => p.hasByline).length;
  const bioPages = pages.filter((p) => p.hasAuthorBio).length;
  const bylineRatio = Math.round((bylinePages / totalPages) * 100) / 100;
  const authorBioRatio = Math.round((bioPages / totalPages) * 100) / 100;

  const firstHandSignals = pages.filter((p) => {
    const content = p.bodyContent.toLowerCase();
    return FIRST_HAND_MARKERS.some((marker) => content.includes(marker));
  }).length;

  const experienceScore = Math.round(
    bylineRatio * 40 + authorBioRatio * 40 + Math.min(firstHandSignals / Math.max(totalPages, 1), 1) * 20,
  );

  return { experienceScore, bylineRatio, authorBioRatio, firstHandSignals };
}

function scoreExpertise(pages, externalCitations) {
  const totalPages = pages.length;
  const authorCredentialCount = pages.reduce(
    (sum, p) => sum + (Array.isArray(p.authorCredentials) ? p.authorCredentials.length : 0), 0,
  );

  const citationSignals = pages.filter((p) => {
    const content = p.bodyContent.toLowerCase();
    return CITATION_MARKERS.some((marker) => content.includes(marker));
  }).length;

  const avgWordCount = totalPages > 0
    ? pages.reduce((sum, p) => sum + (p.bodyContent.split(/\s+/).filter(Boolean).length), 0) / totalPages
    : 0;

  const contentDepthScore = Math.min(100, Math.round((avgWordCount / 1500) * 100));
  const originalResearchPresence = externalCitations.some(
    (c) => c.sourceDomain && c.domainAuthority >= 40,
  );

  const expertiseScore = Math.round(
    Math.min(authorCredentialCount * 10, 40) +
    contentDepthScore * 0.3 +
    Math.min(citationSignals / Math.max(totalPages, 1), 1) * 30,
  );

  return { expertiseScore, authorCredentialCount, contentDepthScore, originalResearchPresence, citationSignals };
}

function scoreAuthoritativeness(externalCitations, trustSignals) {
  const externalCitationCount = externalCitations.length;
  const highDACitations = externalCitations.filter((c) => c.domainAuthority >= 60).length;
  const mediaMentions = trustSignals.filter((s) => s.type === "media_mention").length;
  const awards = trustSignals.filter((s) => s.type === "award").length;

  const authorityScore = Math.round(
    Math.min(externalCitationCount * 5, 40) +
    Math.min(highDACitations * 10, 30) +
    Math.min(mediaMentions * 5, 20) +
    Math.min(awards * 5, 10),
  );

  return { authorityScore, externalCitationCount, highDACitations, mediaMentions, awards };
}

function scoreTrustworthiness(aboutPage, contactPage, trustSignals) {
  let score = 0;

  if (aboutPage.exists) {
    score += 10;
    if (aboutPage.wordCount >= 300) score += 5;
    if (aboutPage.hasTeamSection) score += 5;
    if (aboutPage.hasCompanyHistory) score += 5;
  }

  if (contactPage.exists) {
    score += 10;
    if (contactPage.hasAddress) score += 5;
    if (contactPage.hasPhone) score += 5;
    if (contactPage.hasEmail) score += 5;
  }

  const signalTypes = new Set(trustSignals.map((s) => s.type));
  if (signalTypes.has("privacy_policy")) score += 10;
  if (signalTypes.has("terms_of_service")) score += 10;
  if (signalTypes.has("ssl_cert")) score += 10;
  if (signalTypes.has("review_rating")) score += 5;
  if (signalTypes.has("certification")) score += 10;

  const trustScore = Math.min(100, score);

  return { trustScore, aboutPagePresent: aboutPage.exists, contactPagePresent: contactPage.exists, signalTypes: [...signalTypes] };
}

function analyzeEeat(normalizedInput) {
  const { pages, aboutPage, contactPage, trustSignals, externalCitations, niche } = normalizedInput;

  const experience = scoreExperience(pages);
  const expertise = scoreExpertise(pages, externalCitations);
  const authoritativeness = scoreAuthoritativeness(externalCitations, trustSignals);
  const trustworthiness = scoreTrustworthiness(aboutPage, contactPage, trustSignals);

  const overallEeatScore = Math.round(
    (experience.experienceScore + expertise.expertiseScore +
     authoritativeness.authorityScore + trustworthiness.trustScore) / 4,
  );

  const ymylRiskLevel = YMYL_CATEGORIES.has(niche) ? "high_scrutiny" : "standard";
  const eeatTier = overallEeatScore >= 70 ? "strong" : overallEeatScore >= 40 ? "moderate" : "weak";

  return {
    normalizedInput,
    experience,
    expertise,
    authoritativeness,
    trustworthiness,
    overallEeatScore,
    eeatTier,
    ymylRiskLevel,
  };
}

module.exports = {
  MODULE_KEY,
  analyzeEeat,
  normalizeEeatInput,
};
