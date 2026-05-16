const POLICY_CLASSIFICATIONS = Object.freeze([
  "allow",
  "warn",
  "require_approval",
  "block",
]);

const POLICY_PRIORITY = Object.freeze({
  allow: 0,
  warn: 1,
  require_approval: 2,
  block: 3,
});

const POLICY_ANCHORS = Object.freeze({
  searchEssentials: "https://developers.google.com/search/docs/essentials",
  spamPolicies: "https://developers.google.com/search/docs/essentials/spam-policies",
  helpfulContent: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
});

const GOVERNANCE_POLICY_REGISTRY = Object.freeze([
  {
    policyKey: "keyword_stuffing_risk",
    displayName: "Keyword Stuffing Risk",
    defaultClassification: "warn",
    anchorUrl: POLICY_ANCHORS.spamPolicies,
  },
  {
    policyKey: "schema_spam_risk",
    displayName: "Schema Spam Risk",
    defaultClassification: "require_approval",
    anchorUrl: POLICY_ANCHORS.spamPolicies,
  },
  {
    policyKey: "hidden_text_link_risk",
    displayName: "Hidden Text or Link Risk",
    defaultClassification: "block",
    anchorUrl: POLICY_ANCHORS.spamPolicies,
  },
  {
    policyKey: "dangerous_redirect_risk",
    displayName: "Dangerous Redirect Risk",
    defaultClassification: "block",
    anchorUrl: POLICY_ANCHORS.searchEssentials,
  },
  {
    policyKey: "accidental_deindex_risk",
    displayName: "Accidental Noindex or Deindex Risk",
    defaultClassification: "block",
    anchorUrl: POLICY_ANCHORS.searchEssentials,
  },
  {
    policyKey: "mass_metadata_rewrite_risk",
    displayName: "Mass Metadata Rewrite Risk",
    defaultClassification: "require_approval",
    anchorUrl: POLICY_ANCHORS.helpfulContent,
  },
  {
    policyKey: "duplicate_thin_content_risk",
    displayName: "Duplicate or Thin Content Risk",
    defaultClassification: "require_approval",
    anchorUrl: POLICY_ANCHORS.helpfulContent,
  },
  {
    policyKey: "unsupported_ai_rewrite_risk",
    displayName: "Unsupported AI Rewrite Risk",
    defaultClassification: "block",
    anchorUrl: POLICY_ANCHORS.helpfulContent,
  },
  {
    policyKey: "non_people_first_content_risk",
    displayName: "Non-People-First Content Risk",
    defaultClassification: "require_approval",
    anchorUrl: POLICY_ANCHORS.helpfulContent,
  },
]);

function getGovernancePolicyRegistry() {
  return GOVERNANCE_POLICY_REGISTRY;
}

module.exports = {
  GOVERNANCE_POLICY_REGISTRY,
  POLICY_ANCHORS,
  POLICY_CLASSIFICATIONS,
  POLICY_PRIORITY,
  getGovernancePolicyRegistry,
};
