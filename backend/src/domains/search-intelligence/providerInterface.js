function createUnavailableSerpProvider(providerKey = "unconfigured_serp_provider") {
  return {
    providerKey,
    availabilityStatus: "provider_unavailable",
    async fetchSerpData() {
      return {
        status: "provider_unavailable",
        providerKey,
        message: "No compliant SERP provider is configured.",
        serpFeatures: [],
        competitorResults: [],
        rawPayload: null,
      };
    },
  };
}

function resolveSerpProvider(context = {}) {
  const provider = context.serpProvider;

  if (
    provider &&
    typeof provider.providerKey === "string" &&
    typeof provider.fetchSerpData === "function"
  ) {
    return provider;
  }

  return createUnavailableSerpProvider();
}

module.exports = {
  createUnavailableSerpProvider,
  resolveSerpProvider,
};
