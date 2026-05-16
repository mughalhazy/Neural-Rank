# Backend Domain Boundary Map

Issue:
- Backend Domain Boundaries

Date:
- `2026-05-06`

## New Bounded Contexts
- `site-intelligence`
- `search-intelligence`
- `content-operations`
- `technical-operations`
- `execution`
- `measurement`
- `governance`
- `business-intelligence`

## Compatibility Mapping
- `review_analysis` -> `site-intelligence`
- `content_listing_insights` -> `site-intelligence`
- `keyword_analysis` -> `search-intelligence`
- `rank_tracking` -> `search-intelligence`
- `competitor_analysis` -> `search-intelligence`
- `optimization_layer` -> `content-operations`
- `creative_messaging_layer` -> `content-operations`
- `unified_workflow_layer` -> `execution`

## Boundary Files
- [backend/src/domains/index.js](</D:/Neural Rank/backend/src/domains/index.js>)
- [backend/src/domains/site-intelligence](</D:/Neural Rank/backend/src/domains/site-intelligence>)
- [backend/src/domains/search-intelligence](</D:/Neural Rank/backend/src/domains/search-intelligence>)
- [backend/src/domains/content-operations](</D:/Neural Rank/backend/src/domains/content-operations>)
- [backend/src/domains/technical-operations](</D:/Neural Rank/backend/src/domains/technical-operations>)
- [backend/src/domains/execution](</D:/Neural Rank/backend/src/domains/execution>)
- [backend/src/domains/measurement](</D:/Neural Rank/backend/src/domains/measurement>)
- [backend/src/domains/governance](</D:/Neural Rank/backend/src/domains/governance>)
- [backend/src/domains/business-intelligence](</D:/Neural Rank/backend/src/domains/business-intelligence>)

## Shared Core
- duplicated target normalization was centralized in [backend/src/core/targeting.js](</D:/Neural Rank/backend/src/core/targeting.js>)
- shared domain contract creation lives in [backend/src/core/domainContracts.js](</D:/Neural Rank/backend/src/core/domainContracts.js>)

## Compatibility Rule
- existing module services remain the runtime source of truth
- new domain services expose compatibility adapters that delegate to existing module `run()` functions
- this prepares phased implementation without breaking existing endpoints
