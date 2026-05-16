const https = require("node:https");

const ADAPTER_NAME = "serpProviderAdapter";

const SUPPORTED_PROVIDERS = new Set(["serpapi", "dataforseo"]);

const KNOWN_SERP_FEATURES = new Set([
  "featured_snippet",
  "local_pack",
  "image_pack",
  "sitelinks",
  "knowledge_panel",
  "people_also_ask",
  "video_carousel",
  "top_stories",
  "shopping_results",
  "answer_box",
  "tweet_box",
  "site_links_search_box",
  "reviews",
  "recipes",
  "jobs",
  "flights",
  "events",
]);

function resolveCredentials(context = {}) {
  const serp = context.serpCredentials || context.credentials?.serpProvider || {};
  return {
    provider: (serp.provider || context.serpProvider || process.env.SERP_PROVIDER || "").toLowerCase(),
    apiKey: serp.apiKey || serp.api_key || context.serpApiKey || process.env.SERP_API_KEY || null,
  };
}

function httpsRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        try {
          const raw = Buffer.concat(chunks).toString("utf8");
          resolve({ statusCode: res.statusCode, body: JSON.parse(raw) });
        } catch {
          reject(new Error("Failed to parse SERP provider API response"));
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── SerpApi ───────────────────────────────────────────────────────────────────

async function fetchSerpApi(apiKey, keyword, options = {}) {
  const params = new URLSearchParams({
    engine: "google",
    q: keyword,
    api_key: apiKey,
    gl: options.country || "us",
    hl: options.language || "en",
    num: "10",
    no_cache: "false",
  });

  const result = await httpsRequest({
    hostname: "serpapi.com",
    path: `/search.json?${params.toString()}`,
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (result.statusCode !== 200) {
    throw new Error(`SerpApi error for "${keyword}": ${result.statusCode}`);
  }

  return normalizeSerpApiResult(keyword, result.body);
}

function normalizeSerpApiResult(keyword, data) {
  const features = [];

  if (data.answer_box) features.push("featured_snippet");
  if (data.local_results?.length) features.push("local_pack");
  if (data.images_results?.length) features.push("image_pack");
  if (data.knowledge_graph) features.push("knowledge_panel");
  if (data.related_questions?.length) features.push("people_also_ask");
  if (data.inline_videos?.length) features.push("video_carousel");
  if (data.top_stories?.length) features.push("top_stories");
  if (data.shopping_results?.length) features.push("shopping_results");
  if (data.twitter_results) features.push("tweet_box");
  if (data.recipes_results?.length) features.push("recipes");
  if (data.jobs_results?.length) features.push("jobs");
  if (data.events_results?.length) features.push("events");

  const organicResults = (data.organic_results || []).map((r, i) => ({
    position: r.position || i + 1,
    url: r.link || "",
    title: r.title || "",
    displayUrl: r.displayed_link || "",
    hasSitelinks: !!(r.sitelinks || r.rich_snippet?.top?.detected_extensions?.sitelinks),
  }));

  if (organicResults.some((r) => r.hasSitelinks)) features.push("sitelinks");

  return {
    keyword,
    features: [...new Set(features)].filter((f) => KNOWN_SERP_FEATURES.has(f)),
    organicResults,
    totalResults: data.search_information?.total_results || null,
    searchMetadata: {
      engine: "google",
      country: data.search_parameters?.gl || "us",
      language: data.search_parameters?.hl || "en",
    },
  };
}

// ── DataForSEO ────────────────────────────────────────────────────────────────

async function fetchDataForSeo(apiKey, keywords, options = {}) {
  const tasks = keywords.map((keyword) => ({
    keyword,
    language_name: options.language || "English",
    location_name: options.location || "United States",
    device: options.device || "desktop",
    os: "windows",
  }));

  const payload = JSON.stringify(tasks);

  const result = await httpsRequest(
    {
      hostname: "api.dataforseo.com",
      path: "/v3/serp/google/organic/live/advanced",
      method: "POST",
      headers: {
        Authorization: `Basic ${apiKey}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    },
    payload
  );

  if (result.statusCode !== 200) {
    throw new Error(`DataForSEO API error: ${result.statusCode}`);
  }

  const taskResults = result.body?.tasks || [];
  return taskResults.map((task) => normalizeDataForSeoResult(task));
}

function normalizeDataForSeoResult(task) {
  const keyword = task.data?.keyword || "";
  const items = task.result?.[0]?.items || [];

  const features = [];
  const organicResults = [];

  for (const item of items) {
    const type = item.type || "";

    if (type === "featured_snippet") features.push("featured_snippet");
    else if (type === "local_pack") features.push("local_pack");
    else if (type === "images") features.push("image_pack");
    else if (type === "knowledge_graph") features.push("knowledge_panel");
    else if (type === "people_also_ask") features.push("people_also_ask");
    else if (type === "video") features.push("video_carousel");
    else if (type === "top_stories") features.push("top_stories");
    else if (type === "shopping") features.push("shopping_results");
    else if (type === "answer_box") features.push("answer_box");
    else if (type === "twitter") features.push("tweet_box");
    else if (type === "organic") {
      organicResults.push({
        position: item.rank_absolute || organicResults.length + 1,
        url: item.url || "",
        title: item.title || "",
        displayUrl: item.breadcrumb || "",
        hasSitelinks: !!(item.links),
      });
    }

    if (item.links?.length) features.push("sitelinks");
  }

  return {
    keyword,
    features: [...new Set(features)].filter((f) => KNOWN_SERP_FEATURES.has(f)),
    organicResults,
    totalResults: task.result?.[0]?.items_count || null,
    searchMetadata: {
      engine: "google",
      country: task.data?.location_name || "United States",
      language: task.data?.language_name || "English",
    },
  };
}

// ── Batch fetcher ─────────────────────────────────────────────────────────────

async function fetchBatch(provider, apiKey, keywords, options = {}) {
  if (provider === "serpapi") {
    const results = [];
    for (const keyword of keywords) {
      try {
        results.push(await fetchSerpApi(apiKey, keyword, options));
      } catch {
        results.push({ keyword, features: [], organicResults: [], error: true });
      }
    }
    return results;
  }

  if (provider === "dataforseo") {
    const BATCH_SIZE = 10;
    const allResults = [];
    for (let i = 0; i < keywords.length; i += BATCH_SIZE) {
      const batch = keywords.slice(i, i + BATCH_SIZE);
      try {
        const batchResults = await fetchDataForSeo(apiKey, batch, options);
        allResults.push(...batchResults);
      } catch {
        batch.forEach((keyword) => allResults.push({ keyword, features: [], organicResults: [], error: true }));
      }
    }
    return allResults;
  }

  return [];
}

async function collect(context = {}, request = {}) {
  const { provider, apiKey } = resolveCredentials(context);

  if (!provider || !SUPPORTED_PROVIDERS.has(provider)) {
    return {
      status: "integration_not_connected",
      moduleKey: "serp_feature_analyzer",
      reason: `SERP provider not set or unsupported. Supported: ${[...SUPPORTED_PROVIDERS].join(", ")}.`,
      normalizedPayload: {},
    };
  }

  if (!apiKey) {
    return {
      status: "integration_not_connected",
      moduleKey: "serp_feature_analyzer",
      reason: `SERP provider API key not found for provider: ${provider}.`,
      normalizedPayload: {},
    };
  }

  const keywords = request.keywords || context.keywords || [];

  if (!keywords.length) {
    return {
      status: "integration_not_connected",
      moduleKey: "serp_feature_analyzer",
      reason: "No keywords provided for SERP analysis.",
      normalizedPayload: {},
    };
  }

  const options = {
    country: request.country || context.country || "us",
    language: request.language || context.language || "en",
    location: request.location || context.location || "United States",
    device: request.device || "desktop",
  };

  try {
    const serpEntries = await fetchBatch(provider, apiKey, keywords, options);

    return {
      status: "integration_connected",
      normalizedPayload: { serpEntries },
    };
  } catch (err) {
    return {
      status: "integration_error",
      reason: err.message,
      normalizedPayload: {},
    };
  }
}

async function normalizeInput(context = {}, request = {}) {
  const result = await collect(context, request);
  return { ...result, normalizedPayload: result.normalizedPayload || {} };
}

module.exports = {
  adapterName: ADAPTER_NAME,
  supportsCollection: true,
  isImplemented: true,
  collect,
  normalizeInput,
};
