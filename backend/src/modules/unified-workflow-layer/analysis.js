const MODULE_KEY = "unified_workflow_layer";
const { normalizeProductTarget } = require("../../core/targeting");
const {
  getPriorityScore,
  normalizePriority,
  orderPriorityEntries,
} = require("../../core/prioritization");

const MODULE_WEIGHTS = Object.freeze({
  technical_seo_audit:      1.5,
  backlink_intelligence:    1.4,
  analytics_integration:    1.3,
  search_intent_classifier: 1.2,
  eeat_signals:             1.1,
  on_page_seo_scorer:       1.1,
  review_analysis:          1.0,
  content_listing_insights: 1.0,
  keyword_analysis:         1.0,
  rank_tracking:            1.0,
  competitor_analysis:      1.0,
  optimization_layer:       1.0,
  creative_messaging_layer: 1.0,
  serp_feature_analyzer:    1.0,
  topical_authority:        1.0,
  site_architecture:        1.0,
  local_seo:                1.0,
});

const QUICK_WIN_ACTION_TYPES = new Set([
  "push_page2_keywords",
  "push_page2_rankings",
  "push_page2_to_page1",
]);

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeModuleResult(result, index) {
  const moduleKey =
    normalizeText(result?.moduleKey) ||
    normalizeText(result?.module) ||
    `module_${index + 1}`;

  const insights = Array.isArray(result?.flow?.insight)
    ? result.flow.insight
    : Array.isArray(result?.insights)
      ? result.insights
      : [];
  const priorities = Array.isArray(result?.flow?.priority)
    ? result.flow.priority
    : Array.isArray(result?.priorities)
      ? result.priorities
      : [];
  const actions = Array.isArray(result?.flow?.action)
    ? result.flow.action
    : Array.isArray(result?.actions)
      ? result.actions
      : [];

  return {
    moduleKey,
    status: normalizeText(result?.status) || "completed",
    insights,
    priorities,
    actions,
  };
}

function normalizeInput(moduleInput = {}, adapterResult = {}) {
  const sourceResults = Array.isArray(moduleInput.moduleResults)
    ? moduleInput.moduleResults
    : Array.isArray(moduleInput.orchestrationResults)
      ? moduleInput.orchestrationResults
      : Array.isArray(adapterResult.moduleResults)
        ? adapterResult.moduleResults
        : [];

  return {
    moduleKey: MODULE_KEY,
    productTarget: normalizeProductTarget(moduleInput),
    moduleResults: sourceResults.map(normalizeModuleResult),
  };
}

function priorityWeight(priority) {
  return getPriorityScore(normalizePriority(priority));
}

function summarizeModule(moduleResult) {
  const highestPriority = orderPriorityEntries(
    moduleResult.priorities.map((entry) => ({
      moduleKey: moduleResult.moduleKey,
      type: entry?.type || "priority_item",
      priority: entry?.priority || "low",
      reference:
        entry?.clusterKey ||
        entry?.sectionRef ||
        entry?.assetRef ||
        entry?.competitorRef ||
        entry?.keyword ||
        null,
    })),
  )
    .map((entry) => entry.priority)
    .sort((left, right) => priorityWeight(right) - priorityWeight(left))[0] || "low";

  return {
    moduleKey: moduleResult.moduleKey,
    insightCount: moduleResult.insights.length,
    priorityCount: moduleResult.priorities.length,
    actionCount: moduleResult.actions.length,
    highestPriority,
  };
}

function applyModuleWeight(priority, moduleKey) {
  const weight = MODULE_WEIGHTS[moduleKey] || 1.0;
  const baseScore = getPriorityScore(normalizePriority(priority));
  return Math.round(baseScore * weight);
}

function consolidatePriorities(moduleResults) {
  const entries = moduleResults.flatMap((moduleResult) =>
    moduleResult.priorities.map((priorityEntry) => ({
      moduleKey: moduleResult.moduleKey,
      type: priorityEntry?.type || "priority_item",
      priority: priorityEntry?.priority || "low",
      businessValue: applyModuleWeight(priorityEntry?.priority || "low", moduleResult.moduleKey),
      reference:
        priorityEntry?.clusterKey ||
        priorityEntry?.sectionRef ||
        priorityEntry?.assetRef ||
        priorityEntry?.competitorRef ||
        priorityEntry?.keyword ||
        null,
    })),
  );
  return orderPriorityEntries(entries);
}

function detectFoundationIssue(moduleResults) {
  const techAudit = moduleResults.find((r) => r.moduleKey === "technical_seo_audit");
  if (!techAudit) return null;

  const analysisPayload = techAudit.flow?.analysis?.analysisPayload ?? techAudit.analysisPayload ?? null;
  const healthScore = analysisPayload?.overallHealthScore ?? null;

  if (healthScore !== null && healthScore < 50) {
    return {
      type: "fix_technical_foundation_first",
      priority: "high",
      moduleKey: "technical_seo_audit",
      action: `Technical SEO health score is ${healthScore}/100 — the technical foundation must be stabilised before other optimisation work will have full impact. Resolve Core Web Vitals, crawlability, and indexation issues first.`,
      technicalHealthScore: healthScore,
    };
  }
  return null;
}

function buildQuickWinCluster(moduleResults) {
  const quickWinActions = [];

  for (const result of moduleResults) {
    for (const action of result.actions) {
      if (QUICK_WIN_ACTION_TYPES.has(action?.type)) {
        quickWinActions.push({
          moduleKey: result.moduleKey,
          type: action.type,
          keywords: action.keywords || [],
          action: action.action || "",
        });
      }
    }
  }

  if (quickWinActions.length === 0) return null;

  const allKeywords = [...new Set(quickWinActions.flatMap((a) => a.keywords))];
  return {
    type: "quick_win_cluster",
    priority: "high",
    keywordCount: allKeywords.length,
    keywords: allKeywords.slice(0, 10),
    sources: quickWinActions.map((a) => a.moduleKey),
    action: `${allKeywords.length} page-2 keyword(s) identified across ${quickWinActions.length} module(s). These represent the highest-ROI ranking opportunity — a small push in authority or content can move them to page 1.`,
  };
}

function consolidateActions(moduleResults) {
  return moduleResults.flatMap((moduleResult) =>
    moduleResult.actions.map((actionEntry) => ({
      moduleKey: moduleResult.moduleKey,
      type: actionEntry?.type || "action_item",
      priority: actionEntry?.priority || "low",
      action: normalizeText(actionEntry?.action) || "No action text provided.",
      reference:
        actionEntry?.clusterKey ||
        actionEntry?.sectionRef ||
        actionEntry?.assetRef ||
        actionEntry?.competitorRef ||
        actionEntry?.keyword ||
        null,
    })),
  );
}

function analyzeUnifiedWorkflowLayer(moduleInput = {}, adapterResult = {}) {
  const normalizedInput = normalizeInput(moduleInput, adapterResult);
  const moduleSummaries = normalizedInput.moduleResults.map(summarizeModule);
  const consolidatedPriorities = consolidatePriorities(normalizedInput.moduleResults);
  const consolidatedActions = consolidateActions(normalizedInput.moduleResults);
  const foundationIssue = detectFoundationIssue(normalizedInput.moduleResults);
  const quickWinCluster = buildQuickWinCluster(normalizedInput.moduleResults);

  return {
    normalizedInput,
    moduleSummaries,
    consolidatedPriorities,
    consolidatedActions,
    foundationIssue,
    quickWinCluster,
    summary: {
      moduleCount: normalizedInput.moduleResults.length,
      modulesWithActions: moduleSummaries.filter((item) => item.actionCount > 0).length,
      totalInsights: moduleSummaries.reduce((total, item) => total + item.insightCount, 0),
      totalActions: moduleSummaries.reduce((total, item) => total + item.actionCount, 0),
      highestPriorityCount: consolidatedPriorities.filter(
        (item) => item.priority === "high",
      ).length,
      hasFoundationIssue: Boolean(foundationIssue),
      hasQuickWins: Boolean(quickWinCluster),
    },
  };
}

module.exports = {
  MODULE_KEY,
  analyzeUnifiedWorkflowLayer,
};
