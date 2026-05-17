# Backend Schema / Repository Alignment Report

Issue:
- Backend Schema / Repository Alignment

Date:
- `2026-05-06`

## Scope Completed
- audited all backend module repository files
- compared repository SQL field usage against [20260422020600_backend_foundation.sql](</D:/Neural Rank/supabase/migrations/20260422020600_backend_foundation.sql>)
- aligned repository writes to the existing schema
- added persistence-path verification coverage

## Findings
- the mismatch was systemic across all eight module repositories
- repository code was writing fields not present in schema:
  - `target_ref`
  - `target_type`
  - `product_target_id`
  - `module_key`
  - `action_payload`
- schema expects:
  - `canonical_ref`
  - `target_kind`
  - `target_id`
  - `actions_payload`
- no migration was required for this issue
- alignment was resolved in repository code instead of altering the existing schema

## Implementation
- added shared persistence helper:
  - [backend/src/core/persistence.js](</D:/Neural Rank/backend/src/core/persistence.js>)
- aligned repository files:
  - [backend/src/modules/review-analysis/repository.js](</D:/Neural Rank/backend/src/modules/review-analysis/repository.js>)
  - [backend/src/modules/content-listing-insights/repository.js](</D:/Neural Rank/backend/src/modules/content-listing-insights/repository.js>)
  - [backend/src/modules/keyword-analysis/repository.js](</D:/Neural Rank/backend/src/modules/keyword-analysis/repository.js>)
  - [backend/src/modules/rank-tracking/repository.js](</D:/Neural Rank/backend/src/modules/rank-tracking/repository.js>)
  - [backend/src/modules/competitor-analysis/repository.js](</D:/Neural Rank/backend/src/modules/competitor-analysis/repository.js>)
  - [backend/src/modules/optimization-layer/repository.js](</D:/Neural Rank/backend/src/modules/optimization-layer/repository.js>)
  - [backend/src/modules/creative-messaging-layer/repository.js](</D:/Neural Rank/backend/src/modules/creative-messaging-layer/repository.js>)
  - [backend/src/modules/unified-workflow-layer/repository.js](</D:/Neural Rank/backend/src/modules/unified-workflow-layer/repository.js>)
- threaded `priorityPayload` into persistence calls so persisted priority data matches runtime output

## Field Alignment Result
- `canonical_ref` now replaces `target_ref` in repository writes
- `target_kind` now replaces `target_type` in repository writes
- `target_id` now replaces `product_target_id` in repository writes
- `module_key` is no longer written into run record tables because it does not exist in schema
- `actions_payload` is now written with the schema name
- `priority_payload` now stores actual priority payload instead of duplicating actions by default

## Verification
- persistence test:
  - [backend/src/persistence-alignment.test.js](</D:/Neural Rank/backend/src/persistence-alignment.test.js>)
- full backend validation:
  - [backend/src/full-backend-validation.test.js](</D:/Neural Rank/backend/src/full-backend-validation.test.js>)

Observed result:
- repository writes now match schema field names
- all persistence-path tests passed
- full backend validation passed after alignment

## Acceptance Status
- no repository writes fields missing from schema: `PASS`
- no schema fields required by runtime are missing: `PASS` for the current repository write path
- backend can write module results without SQL field-name mismatch: `PASS`
