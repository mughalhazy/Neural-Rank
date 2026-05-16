const METRIC_SOURCE_REGISTRY = Object.freeze([
  {
    metricId: "rankings",
    displayName: "Rankings",
    sourceStatus: "registered",
    supportsNumericValue: true,
  },
  {
    metricId: "traffic",
    displayName: "Traffic",
    sourceStatus: "registered",
    supportsNumericValue: true,
  },
  {
    metricId: "ctr",
    displayName: "CTR",
    sourceStatus: "registered",
    supportsNumericValue: true,
  },
  {
    metricId: "conversions_leads",
    displayName: "Conversions / Leads",
    sourceStatus: "placeholder",
    supportsNumericValue: true,
  },
  {
    metricId: "page_level_trend",
    displayName: "Page-Level Trend",
    sourceStatus: "placeholder",
    supportsNumericValue: false,
  },
]);

function getMetricSourceRegistry() {
  return METRIC_SOURCE_REGISTRY;
}

module.exports = {
  METRIC_SOURCE_REGISTRY,
  getMetricSourceRegistry,
};
