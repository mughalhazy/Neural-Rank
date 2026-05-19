const { POLICY_PRIORITY } = require("./policyRegistry");

function compareClassification(left, right) {
  return (POLICY_PRIORITY[left] || 0) - (POLICY_PRIORITY[right] || 0);
}

function resolveOverallClassification(findings = []) {
  if (!findings.length) {
    return "allow";
  }

  return findings.reduce((highest, finding) => {
    if (compareClassification(finding.classification, highest) > 0) {
      return finding.classification;
    }

    return highest;
  }, "allow");
}

function createGovernanceResult({
  findings = [],
  evaluatedAt = new Date().toISOString(),
} = {}) {
  const overallClassification = resolveOverallClassification(findings);
  const blockedReasons = findings
    .filter((finding) => finding.classification === "block")
    .map((finding) => finding.reason);
  const warningReasons = findings
    .filter((finding) => finding.classification === "warn")
    .map((finding) => finding.reason);
  const approvalReasons = findings
    .filter((finding) => finding.classification === "require_approval")
    .map((finding) => finding.reason);

  return {
    overallClassification,
    findings,
    blockedReasons,
    warningReasons,
    approvalReasons,
    requiresApproval: overallClassification === "require_approval",
    isBlocked: overallClassification === "block",
    evaluatedAt,
  };
}

module.exports = {
  createGovernanceResult,
  resolveOverallClassification,
};
