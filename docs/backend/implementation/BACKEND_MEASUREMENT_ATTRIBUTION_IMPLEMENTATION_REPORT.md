# Backend Measurement + Attribution Implementation Report

## Scope
- Issue 05: Measurement + Attribution Foundation
- backend only
- no fake metric values
- observed movement kept separate from confirmed impact

## Implemented
- measurement schema:
  - [20260506150000_measurement_attribution_foundation.sql](/D:/Neural%20Rank/supabase/migrations/20260506150000_measurement_attribution_foundation.sql)
- metric source registry:
  - [metricSourceRegistry.js](/D:/Neural%20Rank/backend/src/domains/measurement/metricSourceRegistry.js)
- before/after model and attribution model:
  - [models.js](/D:/Neural%20Rank/backend/src/domains/measurement/models.js)
- repository layer:
  - [repository.js](/D:/Neural%20Rank/backend/src/domains/measurement/repository.js)
- measurement service:
  - [service.js](/D:/Neural%20Rank/backend/src/domains/measurement/service.js)
- contract update:
  - [contract.js](/D:/Neural%20Rank/backend/src/domains/measurement/contract.js)

## Foundation Coverage
- baseline snapshot
- post-change snapshot
- metric source registry
- attribution link:
  - `recommendationId`
  - `taskId`
  - `changeId`
  - `metricId`
- confidence field
- correlation vs confirmed impact classification

## Metric Foundation
- `rankings`
- `traffic`
- `ctr`
- `conversions_leads` placeholder
- `page_level_trend` placeholder

## Runtime Rules
- missing source values are stored as `null`
- snapshot `valueStatus` is `unknown` when no metric value exists
- attribution uses:
  - `unknown`
  - `observed_correlation`
  - `confirmed_impact`
- summary output can answer:
  - what changed
  - when it changed
  - why it changed
  - what metric moved
  - confidence level

## Verification
- direct tests:
  - [measurement-foundation.test.js](/D:/Neural%20Rank/backend/src/measurement-foundation.test.js)
- aggregate validation:
  - [full-backend-validation.test.js](/D:/Neural%20Rank/backend/src/full-backend-validation.test.js)

## Notes
- this issue does not invent metric collection sources
- it stores null or unknown when data is unavailable
- `typecheck` and `lint` scripts are not available in the current [package.json](/D:/Neural%20Rank/package.json)
