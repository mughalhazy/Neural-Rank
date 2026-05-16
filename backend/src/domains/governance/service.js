const { governanceContract } = require("./contract");
const {
  GOVERNANCE_POLICY_REGISTRY,
  getGovernancePolicyRegistry,
} = require("./policyRegistry");
const { createGovernanceResult } = require("./resultModel");

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function flattenPayloadText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(flattenPayloadText).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value).map(flattenPayloadText).filter(Boolean).join(" ");
  }

  return "";
}

function containsAny(text, phrases = []) {
  const haystack = normalizeText(text).toLowerCase();
  return phrases.some((phrase) => haystack.includes(phrase));
}

function countRepeatedKeywordTerms(text) {
  const matches = normalizeText(text)
    .toLowerCase()
    .match(/\b[a-z0-9][a-z0-9_-]{2,}\b/g);

  if (!matches || matches.length === 0) {
    return { repeatedCount: 0, topTerm: "" };
  }

  const counts = new Map();
  for (const term of matches) {
    counts.set(term, (counts.get(term) || 0) + 1);
  }

  let topTerm = "";
  let repeatedCount = 0;

  for (const [term, count] of counts.entries()) {
    if (count > repeatedCount) {
      topTerm = term;
      repeatedCount = count;
    }
  }

  return { repeatedCount, topTerm };
}

function buildEvaluationInput(action = {}) {
  const title = normalizeText(action.title);
  const summary = normalizeText(action.summary);
  const actionType = normalizeText(action.actionType);
  const payloadText = flattenPayloadText(action.payload || {});
  const combinedText = [title, summary, actionType, payloadText].filter(Boolean).join(" ");

  return {
    title,
    summary,
    actionType,
    payloadText,
    combinedText,
  };
}

function pushFinding(findings, policyKey, classification, reason, matchedSignals = []) {
  const policy = GOVERNANCE_POLICY_REGISTRY.find((entry) => entry.policyKey === policyKey);

  findings.push({
    policyKey,
    displayName: policy?.displayName || policyKey,
    classification,
    reason,
    matchedSignals,
    anchorUrl: policy?.anchorUrl || null,
  });
}

function evaluateActionGovernance(action = {}) {
  const findings = [];
  const input = buildEvaluationInput(action);
  const { repeatedCount, topTerm } = countRepeatedKeywordTerms(input.combinedText);

  if (
    repeatedCount >= 8 ||
    containsAny(input.combinedText, [
      "keyword stuffing",
      "stuff keywords",
      "repeat keyword",
      "force exact match everywhere",
    ])
  ) {
    pushFinding(
      findings,
      "keyword_stuffing_risk",
      "block",
      topTerm
        ? `Blocked because the action shows aggressive keyword repetition around "${topTerm}".`
        : "Blocked because the action describes keyword stuffing behavior.",
      [topTerm].filter(Boolean),
    );
  }

  if (
    containsAny(input.combinedText, [
      "fake review schema",
      "fake faq schema",
      "schema spam",
      "inject review markup without reviews",
      "add faq schema to every page",
      "spam schema",
    ])
  ) {
    pushFinding(
      findings,
      "schema_spam_risk",
      "block",
      "Blocked because the action suggests misleading or spammy structured data behavior.",
      ["structured_data", "schema_markup"],
    );
  }

  if (
    containsAny(input.combinedText, [
      "display:none",
      "display none",
      "hidden text",
      "hidden link",
      "invisible text",
      "cloak links",
      "off-screen text",
    ])
  ) {
    pushFinding(
      findings,
      "hidden_text_link_risk",
      "block",
      "Blocked because hidden text or hidden link behavior violates white-hat search guidance.",
      ["hidden_text_or_link"],
    );
  }

  if (
    containsAny(input.combinedText, [
      "sitewide redirect",
      "mass redirect",
      "redirect all",
      "doorway redirect",
      "redirect unrelated pages",
      "force redirect all traffic",
    ])
  ) {
    pushFinding(
      findings,
      "dangerous_redirect_risk",
      "block",
      "Blocked because the redirect pattern is broad enough to risk harmful or deceptive behavior.",
      ["redirect"],
    );
  }

  if (
    containsAny(input.combinedText, [
      "noindex all",
      "deindex all",
      "remove from google",
      "block indexing sitewide",
      "x-robots-tag noindex",
      "noindex every page",
    ])
  ) {
    pushFinding(
      findings,
      "accidental_deindex_risk",
      "block",
      "Blocked because the action can remove important pages from search visibility.",
      ["noindex", "deindex"],
    );
  }

  if (
    containsAny(input.combinedText, [
      "rewrite metadata for every page",
      "mass metadata rewrite",
      "bulk title rewrite",
      "bulk meta description rewrite",
      "sitewide metadata rewrite",
    ])
  ) {
    pushFinding(
      findings,
      "mass_metadata_rewrite_risk",
      "require_approval",
      "Requires approval because large-scale metadata rewrites need human review for quality and reversibility.",
      ["metadata_rewrite"],
    );
  }

  if (
    containsAny(input.combinedText, [
      "spin content",
      "mass rewrite pages",
      "thin content",
      "duplicate content",
      "duplicate landing pages",
      "programmatic filler",
    ])
  ) {
    pushFinding(
      findings,
      "duplicate_thin_content_risk",
      "require_approval",
      "Requires approval because the action risks duplicate or thin content outcomes.",
      ["duplicate_or_thin_content"],
    );
  }

  if (
    containsAny(input.combinedText, [
      "ai spin",
      "mass ai rewrite",
      "generate 100 pages",
      "generate hundreds of pages",
      "auto-generate pages for every keyword",
      "unsupported ai rewrite",
    ])
  ) {
    pushFinding(
      findings,
      "unsupported_ai_rewrite_risk",
      "block",
      "Blocked because the action suggests unsupported mass AI rewriting rather than supervised people-first editing.",
      ["ai_rewrite"],
    );
  }

  if (
    containsAny(input.combinedText, [
      "for search engines only",
      "for bots not users",
      "ranking only",
      "manipulate rankings",
      "clickbait without substance",
      "search-first not people-first",
    ])
  ) {
    pushFinding(
      findings,
      "non_people_first_content_risk",
      "block",
      "Blocked because the action is not framed as people-first content improvement.",
      ["people_first_violation"],
    );
  }

  if (
    findings.length === 0 &&
    containsAny(input.combinedText, [
      "schema",
      "metadata rewrite",
      "rewrite",
      "redirect",
      "ai-assisted",
      "sitewide",
      "bulk",
    ])
  ) {
    pushFinding(
      findings,
      "mass_metadata_rewrite_risk",
      "warn",
      "Warning because the action affects search-facing content or metadata at scale and should be reviewed carefully.",
      ["search_facing_change"],
    );
  }

  return createGovernanceResult({ findings });
}

function assertGovernanceAllowsApproval(governanceResult = {}) {
  if (governanceResult.isBlocked) {
    throw new Error("governance_blocks_approval");
  }
}

function assertGovernanceAllowsTaskCreation(governanceResult = {}) {
  if (governanceResult.isBlocked) {
    throw new Error("governance_blocks_task_creation");
  }
}

function assertGovernanceAllowsExecution(governanceResult = {}, nextStatus) {
  if (governanceResult.isBlocked) {
    throw new Error("governance_blocks_execution");
  }

  if (
    governanceResult.overallClassification === "require_approval" &&
    (nextStatus === "executed" || nextStatus === "verified" || nextStatus === "rolled_back")
  ) {
    return;
  }
}

function createGovernanceService() {
  return {
    contract: governanceContract,
    compatibilityAdapters: {},
    getPolicyRegistry: getGovernancePolicyRegistry,
    evaluateActionGovernance,
    assertGovernanceAllowsApproval,
    assertGovernanceAllowsTaskCreation,
    assertGovernanceAllowsExecution,
  };
}

module.exports = {
  createGovernanceService,
};
