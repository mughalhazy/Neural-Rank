# Contributing to Neural Rank

## Branch naming

`type/short-description`

Types: `feat` · `fix` · `docs` · `refactor` · `test` · `chore`

Examples: `feat/workspace-isolation` · `fix/db-connection` · `docs/update-gap-register`

## Commit style

`type: short present-tense description`

Examples:
- `feat: wire database connection at server startup`
- `fix: filter execution queries by workspace_id`
- `docs: mark P0-2 resolved in PRODUCTION_READINESS_GAPS`

## Before every push

Husky enforces this automatically via git hooks:

- **`pre-commit`** — runs `npm run lint && npm run check:secrets` — blocks commit on ESLint errors or detected secrets
- **`pre-push`** — runs `npm run ci` — blocks push if any test fails or coverage drops below 80%

To run manually:

```bash
npm run ci
```

All test suites must pass and lint must be clean.

## Backend module rules

- All modules follow the 5-file contract: `service.js / analysis.js / insights.js / actions.js / repository.js`
- All modules must implement `INPUT → ANALYSIS → INSIGHT → PRIORITY → ACTION` flow
- No new npm dependencies without explicit approval — the backend is zero-dependency by design
- New modules must include a `service.test.js` covering happy path, adapter fallback, and persistence pattern
- Use `npm run scaffold -- <moduleKey> "Display Name"` to generate the 5-file skeleton — then complete the 5 manual registration steps printed by the script

## Doc update rules

| Change | Required update |
|--------|----------------|
| File added, removed, or renamed | Update `DOC_CATALOGUE.md` |
| Production gap resolved | Mark `RESOLVED` in `ops/PRODUCTION_READINESS_GAPS.md` with date and commit |
| Significant milestone | Append to `ops/PROGRESS.md` and `ops/CHANGELOG.md` |
| New migration applied | Add row to `BACKEND_DATA_AND_PERSISTENCE.md` migration inventory |
| API route added | Add to `AVAILABLE_ROUTES` in `server.js`, add path to `api/openapi.js`, add row to `OPENAPI.yaml`, add row to `BACKEND_API_HARDENING_ENDPOINT_AUDIT_REPORT.md` |
