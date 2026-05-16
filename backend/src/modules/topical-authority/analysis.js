const { normalizeProductTarget } = require("../../core/targeting");

const MODULE_KEY = "topical_authority";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeTopic(raw) {
  if (!raw || typeof raw !== "object") return null;
  const topicKey = normalizeText(raw.topicKey ?? raw.topic ?? raw.name ?? "");
  if (!topicKey) return null;
  return {
    topicKey,
    subtopics: Array.isArray(raw.subtopics)
      ? raw.subtopics.map((s) => normalizeText(typeof s === "string" ? s : s?.key ?? s?.name ?? "")).filter(Boolean)
      : [],
  };
}

function normalizeContent(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    url: String(raw.url ?? ""),
    topicKey: normalizeText(raw.topicKey ?? raw.topic ?? ""),
    subtopicKey: normalizeText(raw.subtopicKey ?? raw.subtopic ?? ""),
    wordCount: toNumber(raw.wordCount ?? raw.word_count, 0),
    hasSchema: Boolean(raw.hasSchema ?? raw.has_schema),
  };
}

function normalizeCompetitorTopic(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    competitorRef: String(raw.competitorRef ?? raw.competitor ?? raw.domain ?? "competitor"),
    topics: Array.isArray(raw.topics)
      ? raw.topics.map((t) => normalizeText(typeof t === "string" ? t : t?.topicKey ?? t?.topic ?? "")).filter(Boolean)
      : [],
  };
}

function normalizeTopicalInput(inputPayload = {}) {
  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(inputPayload),
    targetTopics: Array.isArray(inputPayload.targetTopics)
      ? inputPayload.targetTopics.map(normalizeTopic).filter(Boolean)
      : [],
    competitorTopics: Array.isArray(inputPayload.competitorTopics)
      ? inputPayload.competitorTopics.map(normalizeCompetitorTopic).filter(Boolean)
      : [],
    existingContent: Array.isArray(inputPayload.existingContent)
      ? inputPayload.existingContent.map(normalizeContent).filter(Boolean)
      : [],
  };
}

function buildCoverageMap(targetTopics, existingContent) {
  const contentByTopic = new Map();
  for (const piece of existingContent) {
    if (!piece.topicKey) continue;
    if (!contentByTopic.has(piece.topicKey)) contentByTopic.set(piece.topicKey, []);
    contentByTopic.get(piece.topicKey).push(piece);
  }

  const covered = [];
  const uncovered = [];

  for (const topic of targetTopics) {
    const pieces = contentByTopic.get(topic.topicKey) || [];
    if (pieces.length > 0) {
      covered.push({ ...topic, contentPieces: pieces });
    } else {
      uncovered.push({ ...topic, contentPieces: [] });
    }
  }

  const coverageRatio = targetTopics.length > 0
    ? Math.round((covered.length / targetTopics.length) * 100) / 100
    : 0;

  return { covered, uncovered, coverageRatio, contentByTopic };
}

function scoreCluster(topic, contentPieces) {
  const pillar = contentPieces.find((p) => p.wordCount >= 2000);
  const supportingCount = contentPieces.filter((p) => p.wordCount < 2000).length;
  const subtopicsCovered = new Set(contentPieces.map((p) => p.subtopicKey).filter(Boolean));
  const subtopicCoverageRatio = topic.subtopics.length > 0
    ? subtopicsCovered.size / topic.subtopics.length
    : 0;

  const clusterScore = (pillar ? 50 : 0) + Math.min(supportingCount, 5) * 10;
  return {
    topicKey: topic.topicKey,
    pillarExists: Boolean(pillar),
    pillarWordCount: pillar?.wordCount || 0,
    supportingCount,
    subtopicsCovered: subtopicsCovered.size,
    totalSubtopics: topic.subtopics.length,
    subtopicCoverageRatio: Math.round(subtopicCoverageRatio * 100) / 100,
    clusterScore,
    isThinCluster: Boolean(pillar) && supportingCount < 3,
  };
}

function analyzeClusterCompleteness(covered) {
  const clusters = covered.map((topic) => scoreCluster(topic, topic.contentPieces));
  const avgClusterScore = clusters.length > 0
    ? Math.round(clusters.reduce((s, c) => s + c.clusterScore, 0) / clusters.length)
    : 0;
  const thinClusters = clusters.filter((c) => c.isThinCluster);
  const missingPillars = clusters.filter((c) => !c.pillarExists);

  return { clusters, avgClusterScore, thinClusters, missingPillars };
}

function analyzeCompetitorTopicGaps(targetTopics, competitorTopics) {
  const targetTopicSet = new Set(targetTopics.map((t) => t.topicKey));
  const gapFrequency = new Map();

  for (const competitor of competitorTopics) {
    for (const topic of competitor.topics) {
      if (!targetTopicSet.has(topic)) {
        if (!gapFrequency.has(topic)) gapFrequency.set(topic, 0);
        gapFrequency.set(topic, gapFrequency.get(topic) + 1);
      }
    }
  }

  const topicGaps = Array.from(gapFrequency.entries())
    .map(([topic, competitorCount]) => ({ topic, competitorCount }))
    .sort((a, b) => b.competitorCount - a.competitorCount);

  return { topicGaps, gapCount: topicGaps.length };
}

function analyzeSemanticDepth(existingContent) {
  if (existingContent.length === 0) return { averageWordCount: 0, schemaAdoptionRatio: 0, depthScore: 0 };
  const avgWordCount = Math.round(
    existingContent.reduce((s, c) => s + c.wordCount, 0) / existingContent.length,
  );
  const schemaAdoptionRatio = Math.round(
    (existingContent.filter((c) => c.hasSchema).length / existingContent.length) * 100,
  ) / 100;
  const depthScore = Math.round(
    Math.min(avgWordCount / 1500, 1) * 80 + schemaAdoptionRatio * 20,
  );
  return { averageWordCount: avgWordCount, schemaAdoptionRatio, depthScore };
}

function analyzeTopicalAuthority(normalizedInput) {
  const { targetTopics, competitorTopics, existingContent } = normalizedInput;

  const { covered, uncovered, coverageRatio, contentByTopic } = buildCoverageMap(targetTopics, existingContent);
  const clusterAnalysis = analyzeClusterCompleteness(covered);
  const competitorGapAnalysis = analyzeCompetitorTopicGaps(targetTopics, competitorTopics);
  const semanticDepth = analyzeSemanticDepth(existingContent);

  const overallAuthorityScore = Math.round(
    coverageRatio * 40 +
    (clusterAnalysis.avgClusterScore / 100) * 40 +
    (semanticDepth.depthScore / 100) * 20,
  );

  const authorityTier = overallAuthorityScore >= 70 ? "established"
    : overallAuthorityScore >= 40 ? "developing"
    : "thin";

  return {
    normalizedInput,
    coverageRatio,
    coveredTopics: covered.map((t) => t.topicKey),
    uncoveredTopics: uncovered.map((t) => t.topicKey),
    clusterAnalysis,
    competitorGapAnalysis,
    semanticDepth,
    overallAuthorityScore,
    authorityTier,
    totalTopics: targetTopics.length,
    totalContent: existingContent.length,
  };
}

module.exports = {
  MODULE_KEY,
  analyzeTopicalAuthority,
  normalizeTopicalInput,
};
