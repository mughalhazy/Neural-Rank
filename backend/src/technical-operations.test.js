const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  createTechnicalOperationsService,
} = require("./domains/technical-operations/service");

function loadFixture(name) {
  return fs.readFileSync(
    path.join(__dirname, "domains", "technical-operations", "__fixtures__", name),
    "utf8",
  );
}

async function testHtmlPayloadAuditReturnsStructuredFindings() {
  const technicalService = createTechnicalOperationsService();
  const html = loadFixture("audit-page.html");

  const result = await technicalService.auditTechnicalSeo({
    url: "https://example.com/pricing",
    html,
    robotsTxt: "User-agent: *\nDisallow:\n",
    sitemapXml: "",
    redirectChain: [
      "https://example.com/old-pricing",
      "https://example.com/pricing-2025",
      "https://example.com/pricing",
    ],
  });

  assert.equal(result.sourceHtml.source, "source_html");
  assert.equal(result.sourceHtml.inputType, "html_payload");
  assert.ok(Array.isArray(result.sourceHtml.findings));
  assert.ok(result.sourceHtml.findings.length >= 6);
  assert.ok(result.renderedDom.status.startsWith("renderer_"));
  assert.equal(result.renderedDom.requiresRenderer, true);

  const requiredFindingKeys = new Set([
    "missing_title",
    "missing_meta_description",
    "missing_h1",
    "missing_canonical",
    "sitemap_unavailable",
    "thin_content_risk",
    "redirect_chain_detected",
    "suspicious_link_targets",
    "suspicious_asset_sources",
  ]);

  result.sourceHtml.findings.forEach((finding) => {
    assert.equal(typeof finding.analyzerKey, "string");
    assert.equal(typeof finding.findingKey, "string");
    assert.equal(typeof finding.severity, "string");
    assert.equal(typeof finding.evidence, "object");
    assert.equal(typeof finding.recommendedAction, "object");
    assert.equal(typeof finding.confidence, "number");
    assert.ok(finding.governanceRisk);
    requiredFindingKeys.delete(finding.findingKey);
  });

  assert.equal(requiredFindingKeys.size, 0);
}

async function testUrlOnlyAuditDoesNotPretendRenderedDomExists() {
  const technicalService = createTechnicalOperationsService();

  const result = await technicalService.auditSourceHtml({
    url: "https://example.com/contact",
  });

  assert.equal(result.sourceHtml.inputType, "url_only");
  assert.ok(result.renderedDom.status.startsWith("renderer_"));
  assert.ok(
    result.sourceHtml.findings.some(
      (finding) => finding.findingKey === "source_html_unavailable",
    ),
  );
}

async function run() {
  await testHtmlPayloadAuditReturnsStructuredFindings();
  await testUrlOnlyAuditDoesNotPretendRenderedDomExists();
  console.log("technical-operations tests passed");
}

module.exports = { run };

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
