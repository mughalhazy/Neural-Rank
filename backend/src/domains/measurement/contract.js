const { createDomainServiceContract } = require("../../core/domainContracts");

const measurementContract = createDomainServiceContract({
  domainKey: "measurement",
  displayName: "Measurement",
  serviceKey: "measurementService",
  compatibilityModules: [],
  responsibilities: [
    "own baseline snapshot, post-change snapshot, metric source registry, attribution link, and confidence contracts",
    "separate observed movement from confirmed impact",
    "link recommendations, tasks, changes, and metric outcomes without inventing unavailable metric values",
  ],
});

module.exports = {
  measurementContract,
};
