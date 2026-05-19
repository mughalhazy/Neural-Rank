// In-process Prometheus-compatible metrics registry.
// Zero npm dependencies — emits Prometheus text format directly.
// State resets on server restart (persistent store is T3-04 / Redis).

const counters = new Map();   // name -> { value, labels }[]
const histograms = new Map(); // name -> { sum, count, buckets: Map<le, count> }[]

const DEFAULT_DURATION_BUCKETS = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000, 30000];

function labelKey(labels) {
  return Object.entries(labels).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}="${v}"`).join(",");
}

function increment(name, labels = {}, amount = 1) {
  if (!counters.has(name)) counters.set(name, new Map());
  const series = counters.get(name);
  const key = labelKey(labels);
  const existing = series.get(key);
  if (existing) {
    existing.value += amount;
  } else {
    series.set(key, { value: amount, labels });
  }
}

function observe(name, value, labels = {}, buckets = DEFAULT_DURATION_BUCKETS) {
  if (!histograms.has(name)) histograms.set(name, new Map());
  const series = histograms.get(name);
  const key = labelKey(labels);
  let entry = series.get(key);
  if (!entry) {
    const bucketMap = new Map();
    for (const le of [...buckets, Infinity]) bucketMap.set(le, 0);
    entry = { sum: 0, count: 0, buckets: bucketMap, labels };
    series.set(key, entry);
  }
  entry.sum += value;
  entry.count += 1;
  for (const le of entry.buckets.keys()) {
    if (value <= le) entry.buckets.set(le, entry.buckets.get(le) + 1);
  }
}

function formatLabels(labels) {
  const pairs = Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(",");
  return pairs ? `{${pairs}}` : "";
}

function getMetricsText() {
  const lines = [];

  for (const [name, series] of counters.entries()) {
    lines.push(`# TYPE ${name} counter`);
    for (const { value, labels } of series.values()) {
      lines.push(`${name}${formatLabels(labels)} ${value}`);
    }
  }

  for (const [name, series] of histograms.entries()) {
    lines.push(`# TYPE ${name} histogram`);
    for (const { sum, count, buckets, labels } of series.values()) {
      const base = Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(",");
      for (const [le, bCount] of buckets.entries()) {
        const leStr = le === Infinity ? "+Inf" : String(le);
        const allLabels = base ? `${base},le="${leStr}"` : `le="${leStr}"`;
        lines.push(`${name}_bucket{${allLabels}} ${bCount}`);
      }
      const bl = base ? `{${base}}` : "";
      lines.push(`${name}_sum${bl} ${sum}`);
      lines.push(`${name}_count${bl} ${count}`);
    }
  }

  return lines.join("\n") + "\n";
}

module.exports = { increment, observe, getMetricsText };
