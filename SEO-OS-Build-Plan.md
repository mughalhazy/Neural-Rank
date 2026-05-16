# Neural Rank SEO OS — Full Build Plan

> Generated: 2026-05-15
> Status: Approved for implementation

---

## Architecture Principles (Carried From Existing Code)

Every new module follows the identical 5-file contract already established:

```
modules/<module-name>/
  analysis.js     — normalizes input, runs scoring/classification logic
  insights.js     — converts analysis results into severity-ranked insights
  actions.js      — converts insights into prioritized actions (uses toPriority())
  service.js      — resolveIntegrationInput → analyze → insights → actions → persist
  repository.js   — createPostgresModuleRunRepository({ recordsTable, query })
```

---

## Part 1 — New Modules to Build (10)

---

### Module 1: `technical-seo-audit`

**What it does:** Audits the technical foundation of a website — the layer that determines whether search engines can find, crawl, render, and index content. Without this, all content and keyword work is built on an unaudited foundation.

**Folder:** `backend/src/modules/technical-seo-audit/`

**`analysis.js`**
```
MODULE_KEY = "technical_seo_audit"

normalizeAuditInput(input):
  - url, crawlData[], pageSpeedData{}, robotsData{}, sitemapData{}, schemaData[]

analyzeTechnicalSeo(normalizedInput):
  Core Web Vitals scoring:
    - LCP: <=2.5s=good, <=4.0s=needs_improvement, >4.0s=poor
    - CLS: <=0.1=good, <=0.25=needs_improvement, >0.25=poor
    - INP: <=200ms=good, <=500ms=needs_improvement, >500ms=poor
    - vitalScore = average of 3 individual scores (0-100)

  Crawlability checks:
    - robotsBlocked: pages blocked by robots.txt
    - nofollowCount: internal nofollow links
    - noindexCount: pages with noindex meta tag
    - crawlabilityScore = 100 - (robotsBlocked * 20) - (noindexCount * 10)

  Indexation health:
    - canonicalIssues: self-referencing canonicals, missing canonicals, conflicting canonicals
    - duplicateUrls: trailing slash, www/non-www, http/https variants
    - indexationScore = 100 - (canonicalIssues.length * 15) - (duplicateUrls.length * 10)

  Redirect health:
    - redirectChains: chains of 2+ hops
    - redirect404s: broken redirect targets
    - redirectScore = 100 - (redirectChains.length * 20) - (redirect404s.length * 30)

  Schema markup:
    - schemaTypes: detected types (Article, Product, FAQPage, BreadcrumbList, etc.)
    - schemaErrors: validation failures
    - schemaCoverage = schemaTypes.length > 0 ? "present" : "missing"

  Site security:
    - httpsStatus: secure/mixed/insecure
    - mobileFriendly: boolean
    - securityScore = httpsStatus === "secure" ? 50 : 0 + mobileFriendly ? 50 : 0

  Broken links:
    - brokenInternalLinks: count
    - brokenExternalLinks: count

  overallHealthScore = weighted average of all dimension scores
  issuesBySeverity: critical[], warning[], info[]
```

**`insights.js`**
```
generateTechnicalSeoInsights(analysisResult):
  - Core Web Vitals insight: severity "high" if any vital is "poor"
  - Crawlability insight: severity "high" if crawlabilityScore < 60
  - Indexation insight: severity "high" if canonicalIssues > 2
  - Redirect chain insight: severity "medium" if chains detected
  - Schema insight: severity "medium" if schemaCoverage === "missing"
  - Broken links insight: severity "high" if brokenInternalLinks > 5
  - Summary insight: overall health score band (healthy/needs_work/critical)
```

**`actions.js`**
```
createTechnicalSeoActions(insights):
  - "fix_core_web_vitals": priority "high" if poor vitals
  - "resolve_crawl_blocks": priority "high" if crawlability issues
  - "fix_canonical_issues": priority "high" if indexation issues
  - "collapse_redirect_chains": priority "medium"
  - "implement_schema_markup": priority "medium" if missing
  - "fix_broken_internal_links": priority "high" if count > 5
  - "schedule_technical_reaudit": priority "low" (always present)
```

**`repository.js`** — table: `technical_seo_audit_records`

**moduleCatalog.js entry:**
```js
{ moduleKey: "technical_seo_audit", displayName: "Technical SEO Audit",
  defaultActive: true, initialState: "backend_active" }
```

---

### Module 2: `backlink-intelligence`

**What it does:** Analyzes the domain's link profile — the primary authority signal for organic rankings. Identifies strengths, toxic risks, and link-building gaps vs. competitors.

**Folder:** `backend/src/modules/backlink-intelligence/`

**`analysis.js`**
```
MODULE_KEY = "backlink_intelligence"

normalizeBacklinkInput(input):
  - domain, backlinks[], referringDomains[], competitorBacklinks[]
  - Each backlink: { sourceUrl, sourceDomain, domainAuthority, anchorText,
                     spamScore, linkType (dofollow/nofollow), firstSeen }

analyzeBacklinks(normalizedInput):
  Profile summary:
    - totalBacklinks, uniqueReferringDomains
    - dofollowRatio = dofollow / total
    - averageDomainAuthority

  Authority distribution:
    - highDA (DA>=60), mediumDA (30-59), lowDA (<30) bucket counts
    - authorityScore = (highDA * 3 + mediumDA * 2 + lowDA * 1) / total * 100

  Toxicity analysis:
    - toxicLinks: backlinks where spamScore > 40
    - toxicRatio = toxicLinks.length / total
    - toxicityRisk: "high" | "medium" | "low"

  Anchor text distribution:
    - branded: anchors matching domain/brand name
    - exactMatch: anchors matching target keywords exactly
    - partial: partial keyword matches
    - generic: "click here", "read more", etc.
    - naked: raw URL anchors
    - anchorDiversity score (penalises >30% exact match)

  Competitor link gap:
    - competitorOnlyDomains: referring domains linking to competitor but not target
    - opportunityCount: competitorOnlyDomains.length
    - topOpportunities: top 10 by DA

  Link velocity:
    - recentLinks (last 30 days), historicalLinks
    - velocityTrend: "growing" | "stable" | "declining"

  overallAuthorityScore = weighted composite of all dimensions
```

**`insights.js`**
```
generateBacklinkInsights(analysisResult):
  - Toxicity insight: severity "high" if toxicRatio > 0.15
  - Authority gap insight: severity "high" if authorityScore < 30
  - Anchor text risk insight: severity "medium" if exactMatch > 30%
  - Link opportunity insight: top 5 competitor-only domains by DA
  - Velocity insight: severity "medium" if trend is "declining"
  - Summary insight: authority tier (strong/moderate/weak)
```

**`actions.js`**
```
createBacklinkActions(insights):
  - "disavow_toxic_links": priority "high" if toxicRatio > 0.15
  - "build_high_da_links": priority "high" — top competitor gap domains
  - "diversify_anchor_text": priority "medium" if overconcentrated
  - "outreach_campaign": priority "medium" — opportunity domains list
  - "monitor_link_velocity": priority "low"
```

**`repository.js`** — table: `backlink_intelligence_records`

---

### Module 3: `search-intent-classifier`

**What it does:** Classifies every keyword by search intent, then checks whether existing content format matches that intent. Mismatched intent is one of the most common reasons technically-sound content fails to rank.

**Folder:** `backend/src/modules/search-intent-classifier/`

**`analysis.js`**
```
MODULE_KEY = "search_intent_classifier"

INTENT_SIGNALS = {
  informational: ["how", "what", "why", "when", "guide", "tutorial",
                  "examples", "tips", "learn", "understand", "definition"],
  navigational:  ["login", "sign in", "sign up", "account", "dashboard",
                  "app", "website", "official"],
  transactional: ["buy", "price", "pricing", "cost", "discount", "free trial",
                  "download", "get", "order", "subscribe", "deal"],
  commercial:    ["best", "top", "review", "compare", "vs", "versus",
                  "alternative", "comparison", "rated", "recommend"]
}

CONTENT_FORMAT_MAP = {
  informational:  ["blog post", "guide", "FAQ page", "glossary entry"],
  navigational:   ["landing page", "feature page", "brand page"],
  transactional:  ["product page", "pricing page", "CTA-heavy page"],
  commercial:     ["comparison page", "review article", "listicle", "roundup"]
}

classifyKeywordIntent(keyword):
  - tokenize keyword
  - score each intent category by signal matches
  - primary intent = highest scoring category
  - confidence = primaryScore / totalScore (0-1)
  - recommendedFormats = CONTENT_FORMAT_MAP[primaryIntent]

analyzeSearchIntent(normalizedInput):
  - classify each keyword
  - intentDistribution: { informational: n, navigational: n, ... }
  - alignmentCheck: compare each keyword's intent against provided existingContentType
  - misalignedKeywords: where existingContentType doesn't match recommendedFormats
  - alignmentScore = aligned / total * 100
```

**`insights.js`**
```
generateSearchIntentInsights(analysisResult):
  - Misalignment insight: severity "high" if misalignedKeywords > 3
  - Intent distribution insight: shows the intent breakdown
  - High-value misalignment insight: commercial/transactional keywords served
    by wrong content type (severity "high")
  - Summary insight: alignment score band
```

**`actions.js`**
```
createSearchIntentActions(insights):
  - "reformat_misaligned_content": priority "high" per misaligned keyword
  - "create_intent_matched_content": priority "medium" for missing formats
  - "audit_content_format_quarterly": priority "low"
```

**`repository.js`** — table: `search_intent_records`

---

### Module 4: `serp-feature-analyzer`

**What it does:** Analyzes what SERP features appear for target keywords and scores eligibility to capture them. Featured snippets, PAA boxes, and local packs each have specific content requirements and dramatically different CTR profiles.

**Folder:** `backend/src/modules/serp-feature-analyzer/`

**`analysis.js`**
```
MODULE_KEY = "serp_feature_analyzer"

FEATURE_CTR_IMPACT = {
  featured_snippet:    { ctrBoost: 8,  positionEquivalent: 0  },
  knowledge_panel:     { ctrBoost: 5,  positionEquivalent: 1  },
  local_pack:          { ctrBoost: 15, positionEquivalent: 0  },
  image_carousel:      { ctrBoost: 3,  positionEquivalent: 2  },
  video_carousel:      { ctrBoost: 4,  positionEquivalent: 2  },
  people_also_ask:     { ctrBoost: 2,  positionEquivalent: 3  },
  sitelinks:           { ctrBoost: 10, positionEquivalent: 1  },
}

ELIGIBILITY_REQUIREMENTS = {
  featured_snippet: ["structured Q&A content", "definition paragraphs",
                     "step-by-step lists", "comparison tables"],
  local_pack:       ["Google Business Profile", "local NAP signals",
                     "local keyword targeting"],
  people_also_ask:  ["FAQ schema", "question-format headings",
                     "concise direct answers"],
  image_carousel:   ["optimized images", "image schema", "alt text"],
  video_carousel:   ["YouTube video", "VideoObject schema"],
}

analyzeFeatureOpportunities(normalizedInput):
  Per keyword:
    - featuresPresent: which features appear in its SERP
    - featuresCurrentlyOwned: which features target domain holds
    - featureGaps: present but not owned
    - eligibilityScore per gap feature (based on available content signals)
    - estimatedCtrLift: sum of ctrBoost for ownable gap features

  Summary:
    - totalFeatureGaps, highValueGaps (local_pack, featured_snippet, sitelinks)
    - totalEstimatedCtrLift
    - topOpportunity: highest ctrBoost gap feature
```

**`insights.js`**
```
generateSerpFeatureInsights(analysisResult):
  - Featured snippet opportunity: severity "high" if eligible and not owned
  - Local pack gap: severity "high" if local_pack present but not owned
  - PAA gap: severity "medium" for each PAA opportunity
  - High CTR lift insight: total estimated CTR lift across all gap features
  - Summary: feature ownership ratio
```

**`actions.js`**
```
createSerpFeatureActions(insights):
  - "optimize_for_featured_snippet": priority "high" — format as Q&A/definition/list
  - "claim_local_pack": priority "high" — GBP optimization steps
  - "add_faq_schema": priority "medium" — for PAA eligibility
  - "optimize_image_assets": priority "medium" — for image carousel
  - "create_video_content": priority "medium" — for video carousel
  - "monitor_feature_ownership": priority "low"
```

**`repository.js`** — table: `serp_feature_records`

---

### Module 5: `topical-authority`

**What it does:** Maps topic and subtopic coverage to identify content gaps. Topical authority (covering a subject comprehensively) is increasingly how Google determines which domains rank for entire keyword clusters.

**Folder:** `backend/src/modules/topical-authority/`

**`analysis.js`**
```
MODULE_KEY = "topical_authority"

normalizeTopicalInput(input):
  - targetTopics[]: { topicKey, subtopics[] } — what the site claims to cover
  - competitorTopics[]: { competitorRef, topics[] } — what competitors cover
  - existingContent[]: { url, topicKey, subtopicKey, wordCount, hasSchema }

analyzeTopicalAuthority(normalizedInput):
  Coverage mapping:
    - coveredTopics: topics with at least 1 piece of existing content
    - uncoveredTopics: topics with zero content
    - coverageRatio = coveredTopics / totalTopics

  Cluster completeness:
    - Per topic: { pillarExists, supportingCount, clusterScore }
    - pillarExists: content piece with wordCount > 2000
    - supportingCount: subtopic pieces
    - clusterScore: pillarExists(50) + min(supportingCount, 5) * 10

  Topical gaps (competitor-driven):
    - topics competitors cover that target doesn't: topicGaps[]
    - subtopic gaps within covered topics: subtopicGaps[]
    - gapImpact: sort gaps by how many competitors cover them

  Semantic depth:
    - averageWordCount per topic
    - schemaAdoption ratio
    - depthScore = averageWordCount normalized + schemaAdoption * 20

  overallAuthorityScore = coverageRatio * 40 + clusterScore avg * 40 + depthScore * 20
```

**`insights.js`**
```
generateTopicalAuthorityInsights(analysisResult):
  - Coverage gap insight: severity "high" if coverageRatio < 0.5
  - Missing pillar insight: topics with subtopics but no pillar (severity "high")
  - Competitor gap insight: top 3 topics competitors own that target doesn't
  - Thin cluster insight: topics with pillar but < 3 supporting pieces
  - Summary: authority tier (established / developing / thin)
```

**`actions.js`**
```
createTopicalAuthorityActions(insights):
  - "create_missing_pillar_pages": priority "high" per uncovered core topic
  - "fill_subtopic_gaps": priority "high" for competitor-covered gaps
  - "expand_thin_clusters": priority "medium" — add supporting content
  - "add_schema_to_existing": priority "medium"
  - "schedule_topical_gap_review": priority "low"
```

**`repository.js`** — table: `topical_authority_records`

---

### Module 6: `on-page-seo-scorer`

**What it does:** Scores individual pages against on-page SEO best practices — the signals Google reads at the page level. The existing `optimization-layer` scores sections generically; this module scores actual HTML SEO signals (title tags, meta, heading hierarchy, internal links, URL structure).

**Folder:** `backend/src/modules/on-page-seo-scorer/`

**`analysis.js`**
```
MODULE_KEY = "on_page_seo_scorer"

normalizePageInput(input):
  - pages[]: { url, title, metaDescription, h1, h2s[], h3s[],
               bodyContent, internalLinks[], imageAlts[], wordCount,
               targetKeywords[], urlSlug }

scorePageOnPage(page):
  Title tag (25 pts):
    - present: +10
    - length 50-60 chars: +8, 40-70: +5, else: 0
    - targetKeyword in title: +7

  Meta description (15 pts):
    - present: +5
    - length 150-160 chars: +5, 100-180: +3, else: 0
    - targetKeyword in meta: +5

  Heading hierarchy (20 pts):
    - H1 present: +8
    - H1 contains targetKeyword: +7
    - H2s present (>=2): +5

  Content depth (20 pts):
    - wordCount >= 1500: +10, >= 800: +7, >= 400: +4, else: 0
    - targetKeyword appears in first 100 words: +5
    - keywordDensity 0.5-2%: +5, else 0

  Internal links (10 pts):
    - internalLinks.length >= 3: +5, >= 1: +3, else: 0
    - hasKeywordAnchor (at least one anchor matches keyword): +5

  Image optimization (5 pts):
    - imageAltCoverage = altsPresent / totalImages
    - >= 80%: +5, >= 50%: +3, else: 0

  URL structure (5 pts):
    - urlSlug length <= 60: +2
    - targetKeyword in urlSlug: +2
    - no query parameters: +1

  pageScore = sum of all points (max 100)
  issues: array of specific failed checks

analyzeOnPage(normalizedInput):
  - scorePageOnPage() for each page
  - siteAverageScore = average of all pageScores
  - pagesNeedingWork: pages with score < 60
  - topIssues: most frequent issues across all pages
  - highestGapPage: lowest scoring page
```

**`insights.js`**
```
generateOnPageInsights(analysisResult):
  - Critical page insight: severity "high" for each page with score < 40
  - Title tag insight: severity "high" if > 30% pages have title issues
  - Meta description insight: severity "medium" if > 40% pages missing
  - Heading insight: severity "high" if pages missing H1 > 20%
  - Thin content insight: severity "high" for pages with wordCount < 400
  - Summary: site-wide average on-page score
```

**`actions.js`**
```
createOnPageActions(insights):
  - "rewrite_title_tags": priority "high" — list of affected page URLs
  - "add_meta_descriptions": priority "high" — list of pages missing meta
  - "fix_heading_hierarchy": priority "high" for H1-less pages
  - "expand_thin_content": priority "medium" — pages < 400 words
  - "improve_internal_linking": priority "medium"
  - "optimize_image_alt_text": priority "low"
```

**`repository.js`** — table: `on_page_seo_records`

---

### Module 7: `site-architecture`

**What it does:** Analyzes how pages are connected and whether crawl equity flows efficiently. Orphan pages, excessive crawl depth, and poor silo structure all reduce crawl efficiency and dilute ranking signals.

**Folder:** `backend/src/modules/site-architecture/`

**`analysis.js`**
```
MODULE_KEY = "site_architecture"

normalizeArchitectureInput(input):
  - pages[]: { url, depth, inboundInternalLinks, outboundInternalLinks,
               wordCount, lastModified }
  - internalLinkGraph[]: { sourceUrl, targetUrl, anchorText }

analyzeSiteArchitecture(normalizedInput):
  Crawl depth distribution:
    - depthBuckets: { depth1: n, depth2: n, depth3: n, depth4plus: n }
    - deepPageRatio = depth4plus / total
    - depthScore = 100 - deepPageRatio * 100

  Orphan pages:
    - orphanPages: pages with inboundInternalLinks === 0
    - orphanRatio = orphanPages / total
    - orphanSeverity: "high" if orphanRatio > 0.1

  Internal link equity:
    - topLinkedPages: sorted by inboundInternalLinks desc (top 10)
    - bottomLinkedPages: pages receiving only 1-2 internal links
    - equityGiniCoefficient: measures distribution equality (0=even, 1=concentrated)

  Silo/cluster structure:
    - detect topic clusters from URL path segments
    - clusterCompleteness: clusters with internal cross-linking vs isolated pages
    - siloScore = clusterCompleteness / totalClusters * 100

  Redirect chains:
    - chains: sequences of 2+ redirects
    - chainDepthMax

  overallArchitectureScore = (depthScore + (100 - orphanRatio*100) + siloScore) / 3
```

**`insights.js`**
```
generateSiteArchitectureInsights(analysisResult):
  - Orphan pages insight: severity "high" if orphanRatio > 0.1
  - Deep pages insight: severity "medium" if deepPageRatio > 0.2
  - Link equity concentration insight: severity "medium" if giniCoefficient > 0.7
  - Cluster isolation insight: severity "medium" for isolated clusters
  - Summary: architecture health score band
```

**`actions.js`**
```
createSiteArchitectureActions(insights):
  - "link_orphan_pages": priority "high" — list of orphaned URLs
  - "flatten_deep_pages": priority "medium" — reduce depth via navigation/linking
  - "redistribute_internal_links": priority "medium" — link equity balancing
  - "strengthen_topic_silos": priority "medium" — cross-link cluster pages
  - "eliminate_redirect_chains": priority "high" if chains detected
```

**`repository.js`** — table: `site_architecture_records`

---

### Module 8: `eeat-signals`

**What it does:** Evaluates Experience, Expertise, Authoritativeness, and Trustworthiness signals — Google's quality framework that determines whether a site is treated as a credible source, especially in competitive or YMYL niches.

**Folder:** `backend/src/modules/eeat-signals/`

**`analysis.js`**
```
MODULE_KEY = "eeat_signals"

YMYL_CATEGORIES = ["health", "finance", "legal", "news", "safety", "government"]

normalizeEeatInput(input):
  - pages[]: { url, hasAuthorBio, authorCredentials[], hasByline }
  - aboutPage: { exists, wordCount, hasTeamSection, hasCompanyHistory }
  - contactPage: { exists, hasAddress, hasPhone, hasEmail }
  - trustSignals[]: { type, value }
    types: "review_rating", "certification", "award", "media_mention",
           "ssl_cert", "privacy_policy", "terms_of_service"
  - niche: string (checked against YMYL_CATEGORIES)
  - externalCitations[]: { sourceUrl, sourceDomain, domainAuthority }

analyzeEeat(normalizedInput):
  Experience signals (25 pts):
    - bylinePresence ratio: pages with author byline
    - authorBioRatio: pages with linked author bio
    - firstHandContentSignals: testimonials, case studies, original research
    - experienceScore

  Expertise signals (25 pts):
    - authorCredentialCount: total credentials documented across authors
    - contentDepthScore: average wordCount + schema adoption
    - originalResearchPresence: boolean
    - expertiseScore

  Authoritativeness signals (25 pts):
    - externalCitationCount
    - highDACitationCount (DA >= 60 sources)
    - mediaMentionCount
    - awardCount
    - authorityScore

  Trustworthiness signals (25 pts):
    - aboutPageScore: exists(10) + wordCount>300(5) + team(5) + history(5) = 25
    - contactPageScore: exists(10) + address(5) + phone(5) + email(5) = 25
    - privacyPolicy: +10
    - termsOfService: +10
    - sslCert: +10
    - trustScore = weighted sum / max

  ymylRiskLevel: if niche in YMYL_CATEGORIES → "high_scrutiny"
  overallEeatScore = (experienceScore + expertiseScore + authorityScore + trustScore) / 4
```

**`insights.js`**
```
generateEeatInsights(analysisResult):
  - Trust gap insight: severity "high" if trustScore < 50
  - Author credibility insight: severity "high" if authorBioRatio < 0.5
  - YMYL warning insight: severity "high" if ymylRiskLevel + eeatScore < 60
  - Authority signals insight: severity "medium" if externalCitations < 5
  - Summary: E-E-A-T tier (strong/moderate/weak)
```

**`actions.js`**
```
createEeatActions(insights):
  - "add_author_bios_and_credentials": priority "high"
  - "enhance_about_page": priority "high" if trust gap
  - "add_privacy_policy_terms": priority "high" if missing
  - "pursue_external_citations": priority "medium"
  - "add_original_research": priority "medium"
  - "monitor_eeat_quarterly": priority "low"
```

**`repository.js`** — table: `eeat_signal_records`

---

### Module 9: `local-seo` *(initialState: `backend_active`, opt-in only)*

**What it does:** For businesses targeting local search — the local pack, Google Maps, and geo-targeted queries. Covers GBP completeness, NAP consistency, local keyword rankings, and review velocity.

**Folder:** `backend/src/modules/local-seo/`

**`analysis.js`**
```
MODULE_KEY = "local_seo"

normalizeLocalInput(input):
  - businessName, address, phone, website
  - googleBusinessProfile: { categorySet, hoursComplete, photosCount,
                              postsCount, qaCount, descriptionPresent,
                              attributesCount, productsComplete }
  - citations[]: { source, name, address, phone } (NAP from directories)
  - localKeywords[]: { keyword, localPackPosition, organicPosition }
  - reviewSignals: { totalReviews, averageRating, monthlyVelocity, responseRate }

analyzeLocalSeo(normalizedInput):
  GBP completeness (40 pts):
    - categorySet: +10
    - hoursComplete: +8
    - photosCount >= 10: +7, >= 3: +4
    - descriptionPresent: +5
    - postsCount >= 1: +5
    - productsComplete: +5
    - gbpScore

  NAP consistency (20 pts):
    - napMatches: citations where name+address+phone all match target
    - napConsistencyRatio = napMatches / citations.length
    - napScore = napConsistencyRatio * 20

  Local keyword visibility (25 pts):
    - localPackPositions: keywords ranked in local pack (positions 1-3)
    - localPackRatio = localPackPositions / totalLocalKeywords
    - avgLocalPackPosition
    - visibilityScore = localPackRatio * 25

  Review signals (15 pts):
    - ratingScore = averageRating >= 4.5 ? 8 : averageRating >= 4.0 ? 5 : 2
    - velocityScore = monthlyVelocity >= 5 ? 4 : monthlyVelocity >= 2 ? 2 : 0
    - responseScore = responseRate >= 0.8 ? 3 : responseRate >= 0.5 ? 1 : 0
    - reviewScore = ratingScore + velocityScore + responseScore

  overallLocalScore = gbpScore + napScore + visibilityScore + reviewScore
```

**`insights.js`** — GBP gap, NAP inconsistency, review velocity, pack visibility

**`actions.js`** — "complete_gbp_profile", "fix_nap_citations", "build_review_velocity", "target_local_keywords"

**`repository.js`** — table: `local_seo_records`

---

### Module 10: `analytics-integration`

**What it does:** Ingests real data from Google Search Console and Google Analytics 4. This transforms the SEO OS from an input-driven analysis tool to a data-driven intelligence platform. Every other module can be enriched by live performance signals.

**Folder:** `backend/src/modules/analytics-integration/`

**`analysis.js`**
```
MODULE_KEY = "analytics_integration"

normalizeAnalyticsInput(input):
  - gscData: { searchAnalytics[], indexCoverage{}, coreWebVitals{}, crawlErrors[] }
    searchAnalytics[]: { query, page, clicks, impressions, ctr, position }
  - ga4Data: { sessions{}, organicLanding[], conversions[], pageMetrics[] }

analyzeAnalyticsData(normalizedInput):
  CTR efficiency analysis:
    - highImpressionLowCtr: queries with impressions > 500 && ctr < 0.03
    - ctrOpportunities: sorted by (expectedCtr(position) - actualCtr) * impressions
    - expectedCtr lookup table by position:
        pos 1: 28%, pos 2: 15%, pos 3: 11%, pos 4: 8%, pos 5: 7%, etc.

  Traffic opportunity gaps:
    - position11to20Keywords: high-volume keywords on page 2 (quick-win targets)
    - positionGains: keywords that moved up since last period
    - positionDeclines: keywords that dropped

  Index coverage health:
    - validIndexed, warnings, errors, excluded
    - crawlErrors: 404s, server errors, redirect errors

  Landing page performance:
    - topOrganicLandingPages: by organic sessions
    - decliningPages: pages with >20% organic session drop MoM
    - conversionRateByLandingPage: sorts by revenue-generating pages

  Content freshness signals:
    - pagesWithDecliningImpressions: may need refresh
    - newlyIndexedPages: recently appearing in GSC

  overallAnalyticsHealthScore based on indexCoverage + ctrEfficiency + trafficTrend
```

**`insights.js`**
```
generateAnalyticsInsights(analysisResult):
  - CTR opportunity insight: severity "high" for high-impression/low-CTR queries
  - Page 2 quick-win insight: severity "high" for position 11-20 keywords
  - Declining page insight: severity "high" for traffic drops > 20%
  - Index error insight: severity "high" if crawlErrors > 10
  - Conversion gap insight: high-traffic pages with zero conversions
  - Summary: analytics health score band
```

**`actions.js`**
```
createAnalyticsActions(insights):
  - "optimize_title_meta_for_ctr": priority "high" — specific low-CTR queries
  - "push_page2_keywords_to_page1": priority "high" — content/link updates
  - "investigate_declining_pages": priority "high" — traffic drop analysis
  - "fix_index_coverage_errors": priority "high"
  - "add_cta_to_high_traffic_zero_conversion": priority "high"
  - "refresh_declining_impression_content": priority "medium"
```

**`repository.js`** — table: `analytics_integration_records`

---

## Part 2 — Existing Module Enhancements

---

### Enhancement 1: `keyword-analysis`

**Current gaps:** Expansion logic uses hardcoded tokens (`"insights"`, `"analysis"`, `"tool"`) that don't adapt to the actual industry/niche. No intent signal. No trend direction. SERP feature targeting absent.

**Additions to `analysis.js`:**
- Add `intentSignal` per keyword: run basic signal matching from shared `INTENT_SIGNALS`
- Add `trendDirection`: `"rising"` | `"stable"` | `"declining"` based on `volumePrevious` vs `volume` delta if provided
- Remove hardcoded `["insights", "analysis", "tool"]` expansions — replace with context-aware expansion using tokens from the highest-volume keywords in the input set as seed terms
- Add `serpFeaturePresent` flag per keyword if `serpData` provided
- Add `opportunityTier`: `"quick_win"` if position 11-20, `"priority"` if high volume + low difficulty

**Additions to `insights.js`:**
- Add `"rising_keyword_opportunity"` insight for `trendDirection === "rising"`
- Add `"quick_win_cluster"` insight for `opportunityTier === "quick_win"`

**Additions to `actions.js`:**
- Add `"target_rising_keywords"` action
- Add `"push_page2_keywords"` action (quick win cluster)

---

### Enhancement 2: `competitor-analysis`

**Current gaps:** Only scores 4 dimensions numerically. No backlink gap. No topical overlap. No specific competitor keyword list.

**Additions to `analysis.js`:**
- Add `backlinkGap` dimension: `{ competitorDA, targetDA, daGap }`
- Add `topicalGap` dimension: `{ competitorTopicCount, targetTopicCount, uniqueCompetitorTopics[] }`
- Add `serpOverlapScore`: % of competitor's ranking keywords that target also ranks for (0-100)
- Add `contentVelocity`: competitor publishing cadence vs target
- Expand `pressureScore` to 6 dimensions (was 4)

**Additions to `insights.js`:**
- Add DA gap insight: severity `"high"` if `daGap > 20`
- Add topical gap insight: unique competitor topics not covered by target

---

### Enhancement 3: `rank-tracking`

**Current gaps:** Tracks position only. No CTR data, no impression data, no position-zero tracking.

**Additions to `analysis.js`:**
- Add to each rank entry: `{ clicks, impressions, ctr }` (optional, from GSC)
- Add `ctrEfficiency`: `actualCtr` vs `expectedCtr(position)` ratio
- Add `positionZeroTracking`: flag if `currentPosition === 0` (featured snippet)
- Add `quickWinFlag`: `currentPosition` between 11 and 20
- Track `rankingUrl` per keyword (which page is ranking)

**Additions to `insights.js`:**
- Add `"ctr_underperformance"` insight: ranking well but low CTR → title/meta issue
- Add `"featured_snippet_gained_lost"` insight
- Add `"quick_win_positions"` insight: page 2 keywords needing a push

---

### Enhancement 4: `optimization-layer`

**Current gaps:** Scores sections by keyword coverage and content length but misses readability, semantic richness, and content freshness. Should be refocused on **content optimization** while `on-page-seo-scorer` handles HTML structure signals.

**Additions to `analysis.js`:**
- Add `readabilityScore` per section: approximate Flesch reading ease from average sentence length and syllable estimation
- Add `semanticRichness`: count of LSI/related keywords present in content vs a provided `relatedTerms[]` list
- Add `keywordDensity`: occurrences / wordCount (flag if > 3% = overstuffed)
- Add `freshnessSignal`: `lastModified` date — content older than 12 months flagged as `"stale_candidate"`

---

### Enhancement 5: `content-listing-insights`

**Current gaps:** Checks structural completeness but misses readability, E-E-A-T content signals, and content depth vs competitors.

**Additions to `analysis.js`:**
- Add `readabilityTier`: `"accessible"` | `"moderate"` | `"complex"` from sentence length heuristic
- Add `eeAtContentSignals`: detects presence of first-person experience language, author attribution, citation markers (`"according to"`, `"study shows"`, etc.)
- Add `competitorDepthComparison`: if `competitorWordCounts[]` provided, flag if target content is shorter than competitor average
- Add `structuredContentSignals`: detects lists, tables, headings in body — structured content scores higher for featured snippet eligibility

---

### Enhancement 6: `review-analysis`

**Current gaps:** Built for app store reviews. Web reviews (Google, Trustpilot, G2, Capterra) are equally important trust signals.

**Additions to `analysis.js`:**
- Add `reviewSource` normalization: `"app_store"` | `"play_store"` | `"google_business"` | `"trustpilot"` | `"g2"` | `"capterra"` | `"other"`
- Add `verifiedBuyerRatio`: proportion of reviews marked as verified
- Add `reviewRecency`: cluster reviews into `<30d`, `30-90d`, `>90d` buckets
- Add `responseRate`: how many reviews received an owner/developer response

---

### Enhancement 7: `unified-workflow-layer`

**Current gaps:** Consolidates 8 modules equally. When expanded to 18 modules, technical and authority issues must be weighted higher as they block all content gains.

**Additions to `analysis.js`:**
```js
moduleWeights = {
  technical_seo_audit:      1.5,  // technical blocks amplified
  backlink_intelligence:    1.4,  // authority layer amplified
  analytics_integration:    1.3,  // real-data signals amplified
  search_intent_classifier: 1.2,
  // all others:            1.0
}
```
- Apply weight multiplier to priority scoring when consolidating
- Add `foundationHealthCheck`: if `technical_seo_audit.overallHealthScore < 50`, surface a top-level `"fix_technical_foundation_first"` workflow priority regardless of other module outputs
- Add `quickWinCluster`: group position 11-20 keywords from `keyword_analysis` + `rank_tracking` into a unified "quick wins" action block

---

## Part 3 — New Core Utilities

### `core/intentClassifier.js`
Shared intent classification logic (avoids duplication between `search-intent-classifier` and `keyword-analysis`):
```
- INTENT_SIGNALS map (informational/navigational/transactional/commercial)
- classifyIntent(keyword) → { primaryIntent, confidence, recommendedFormats }
- batchClassifyIntents(keywords[]) → classified[]
```

### `core/seoScorer.js`
Shared scoring formulas used across multiple modules:
```
- expectedCtrByPosition(position) → number  (lookup table)
- ctrEfficiencyScore(actualCtr, position) → number
- contentDepthTier(wordCount) → "thin" | "moderate" | "comprehensive" | "authoritative"
- readabilityTier(avgSentenceLength) → "accessible" | "moderate" | "complex"
```

### `core/domainAuthorityScorer.js`
Shared authority calculations used by `backlink-intelligence` and `competitor-analysis`:
```
- authorityTier(da) → "high" | "medium" | "low"
- authorityGapSeverity(targetDA, competitorDA) → "critical" | "significant" | "manageable"
- computeAuthorityScore(backlinks[]) → number (0-100)
```

---

## Part 4 — New Integration Adapters

Each lives in `backend/src/integrations/` and implements `collect(context, request)` or `normalizeInput(context, request)`:

| Adapter | Module(s) it feeds | Data it provides |
|---|---|---|
| `google-search-console` | analytics-integration, rank-tracking | Search analytics, index coverage, CWV, crawl errors |
| `google-analytics-4` | analytics-integration | Sessions, landing pages, conversions, organic traffic |
| `pagespeed-insights` | technical-seo-audit | Core Web Vitals, performance scores per URL |
| `backlink-provider` | backlink-intelligence, competitor-analysis | Backlinks, referring domains, DA, anchor text, spam score |
| `serp-provider` | serp-feature-analyzer, keyword-analysis | SERP feature presence per keyword, PAA boxes, local pack |

---

## Part 5 — Database Schema Additions

10 new tables following the exact existing pattern (`app_public` schema, UUID PKs, JSONB payloads, `updated_at` trigger):

```sql
technical_seo_audit_records
backlink_intelligence_records
search_intent_records
serp_feature_records
topical_authority_records
on_page_seo_records
site_architecture_records
eeat_signal_records
local_seo_records
analytics_integration_records
```

Each table:
```sql
CREATE TABLE app_public.<table_name> (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_target  JSONB,
  input_payload   JSONB,
  analysis_payload JSONB,
  insight_payload  JSONB,
  priority_payload JSONB,
  action_payload   JSONB,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## Part 6 — moduleCatalog.js Additions

```js
{ moduleKey: "technical_seo_audit",      displayName: "Technical SEO Audit",
  defaultActive: true,  initialState: "backend_active" },
{ moduleKey: "backlink_intelligence",    displayName: "Backlink Intelligence",
  defaultActive: true,  initialState: "backend_active" },
{ moduleKey: "search_intent_classifier", displayName: "Search Intent Classifier",
  defaultActive: true,  initialState: "backend_active" },
{ moduleKey: "serp_feature_analyzer",   displayName: "SERP Feature Analyzer",
  defaultActive: true,  initialState: "backend_active" },
{ moduleKey: "topical_authority",        displayName: "Topical Authority",
  defaultActive: true,  initialState: "backend_active" },
{ moduleKey: "on_page_seo_scorer",       displayName: "On-Page SEO Scorer",
  defaultActive: true,  initialState: "backend_active" },
{ moduleKey: "site_architecture",        displayName: "Site Architecture",
  defaultActive: true,  initialState: "backend_active" },
{ moduleKey: "eeat_signals",             displayName: "E-E-A-T Signals",
  defaultActive: true,  initialState: "backend_active" },
{ moduleKey: "local_seo",               displayName: "Local SEO",
  defaultActive: false, initialState: "backend_active" },  // opt-in per client
{ moduleKey: "analytics_integration",   displayName: "Analytics Integration",
  defaultActive: true,  initialState: "backend_active" },
```

---

## Part 7 — Build Sequence (Phased)

### Phase 1 — Foundation *(build first — unblocks everything else)*
1. `core/intentClassifier.js`
2. `core/seoScorer.js`
3. `core/domainAuthorityScorer.js`
4. **Module:** `technical-seo-audit`
5. **Module:** `on-page-seo-scorer`

### Phase 2 — Authority Layer
6. **Module:** `backlink-intelligence`
7. **Module:** `eeat-signals`
8. **Enhancement:** `competitor-analysis` (DA gap + topical gap dimensions)

### Phase 3 — Intent & Visibility
9. **Module:** `search-intent-classifier`
10. **Module:** `serp-feature-analyzer`
11. **Enhancement:** `keyword-analysis` (intent signal + context-aware expansion)
12. **Enhancement:** `rank-tracking` (CTR efficiency + position-zero tracking)

### Phase 4 — Content & Architecture
13. **Module:** `topical-authority`
14. **Module:** `site-architecture`
15. **Enhancement:** `optimization-layer` (readability + semantic richness)
16. **Enhancement:** `content-listing-insights` (E-E-A-T content signals)

### Phase 5 — Data & Consolidation
17. **Module:** `analytics-integration`
18. **Module:** `local-seo` *(optional — activate per client)*
19. **Enhancement:** `unified-workflow-layer` (module weights + foundation gating)
20. **Enhancement:** `review-analysis` (web review sources)

### Phase 6 — Integration Adapters
21. `google-search-console` adapter
22. `google-analytics-4` adapter
23. `pagespeed-insights` adapter
24. `backlink-provider` adapter
25. `serp-provider` adapter

---

## Summary

| | Count |
|---|---|
| New modules | 10 |
| Existing module enhancements | 7 |
| New core utilities | 3 |
| New integration adapters | 5 |
| New DB tables | 10 |
| **Total module count after build** | **18** |

The result is a complete SEO OS covering all six pillars of organic ranking:

```
Technical Health → Authority → Intent → Visibility → Content → Architecture
```

All consolidating through a weighted `unified-workflow-layer` that gates on technical health first, surfaces quick wins as a cluster, and applies authority/analytics signals at amplified weight — ensuring the most impactful work always surfaces at the top of the execution queue.
