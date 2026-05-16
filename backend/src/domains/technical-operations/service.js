const { technicalOperationsContract } = require("./contract");
const {
  buildRenderedDomPlaceholder,
  runSourceHtmlAnalyzers,
} = require("./sourceHtmlAnalyzers");

function summarizeFindings(findings = []) {
  return {
    totalFindings: findings.length,
    criticalCount: findings.filter((finding) => finding.severity === "critical").length,
    highCount: findings.filter((finding) => finding.severity === "high").length,
    mediumCount: findings.filter((finding) => finding.severity === "medium").length,
    lowCount: findings.filter((finding) => finding.severity === "low").length,
  };
}

async function auditSourceHtml(input = {}) {
  const sourceHtmlResult = runSourceHtmlAnalyzers(input);

  return {
    contract: technicalOperationsContract,
    sourceHtml: {
      ...sourceHtmlResult,
      summary: summarizeFindings(sourceHtmlResult.findings),
    },
    renderedDom: buildRenderedDomPlaceholder(),
  };
}

async function auditTechnicalSeo(input = {}) {
  return auditSourceHtml(input);
}

function createTechnicalOperationsService() {
  return {
    contract: technicalOperationsContract,
    compatibilityAdapters: {},
    auditSourceHtml,
    auditTechnicalSeo,
  };
}

module.exports = {
  createTechnicalOperationsService,
};
