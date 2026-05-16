function createDomainServiceContract({
  domainKey,
  displayName,
  serviceKey,
  compatibilityModules = [],
  responsibilities = [],
} = {}) {
  return Object.freeze({
    domainKey,
    displayName,
    serviceKey,
    compatibilityModules,
    responsibilities,
  });
}

module.exports = {
  createDomainServiceContract,
};
