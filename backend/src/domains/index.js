const {
  createSiteIntelligenceService,
} = require("./site-intelligence/service");
const {
  createSearchIntelligenceService,
} = require("./search-intelligence/service");
const {
  createContentOperationsService,
} = require("./content-operations/service");
const {
  createTechnicalOperationsService,
} = require("./technical-operations/service");
const {
  createExecutionService,
} = require("./execution/service");
const {
  createMeasurementService,
} = require("./measurement/service");
const {
  createGovernanceService,
} = require("./governance/service");
const {
  createBusinessIntelligenceService,
} = require("./business-intelligence/service");

function getDomainServices() {
  return {
    site_intelligence: createSiteIntelligenceService(),
    search_intelligence: createSearchIntelligenceService(),
    content_operations: createContentOperationsService(),
    technical_operations: createTechnicalOperationsService(),
    execution: createExecutionService(),
    measurement: createMeasurementService(),
    governance: createGovernanceService(),
    business_intelligence: createBusinessIntelligenceService(),
  };
}

function getDomainBoundaryMap() {
  const services = getDomainServices();

  return Object.fromEntries(
    Object.entries(services).map(([domainKey, service]) => [
      domainKey,
      {
        contract: service.contract,
        compatibilityModuleKeys: Object.keys(service.compatibilityAdapters),
      },
    ]),
  );
}

module.exports = {
  getDomainBoundaryMap,
  getDomainServices,
};
