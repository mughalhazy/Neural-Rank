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

```bash
npm run ci
```

All 29 test suites must pass and lint must be clean.

## Doc update rules

| Change | Required update |
|--------|----------------|
| File added, removed, or renamed | Update `DOC_CATALOGUE.md` |
| Production gap resolved | Mark `RESOLVED` in `PRODUCTION_READINESS_GAPS.md` with date and commit |
| Significant milestone | Append to `progress.md` and `CHANGELOG.md` |

## Backend module rules

- All modules follow the 5-file contract: `service.js / analysis.js / insights.js / actions.js / repository.js`
- All modules must implement `INPUT → ANALYSIS → INSIGHT → PRIORITY → ACTION` flow
- No new npm dependencies without explicit approval — the backend is zero-dependency by design
- New modules must include a `service.test.js` covering happy path, adapter fallback, and persistence pattern
