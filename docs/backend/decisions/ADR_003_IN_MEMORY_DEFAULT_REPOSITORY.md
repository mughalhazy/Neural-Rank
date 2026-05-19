# ADR 003 — In-Memory Default Repository with Postgres Upgrade Path

**Date:** 2026-05-16
**Status:** Accepted
**Dimension:** Architecture · Data Layer · Developer Experience

---

## Context

The backend needs persistence for recommendations, tasks, audit logs, measurement snapshots, attribution links, and business profiles. The Render free tier spins down after 15 minutes of inactivity, wiping all in-process state.

The team must decide: require a database connection at all times, or allow in-memory operation as a fallback.

## Decision

Each domain repository has **two implementations**: an in-memory version (used in CI and when `DATABASE_URL` is absent) and a Postgres version (used in production when `DATABASE_URL` is set). The server resolves which implementation to use at startup by checking whether `context.query` is present.

**JS catalog is the authoritative source of truth for module activation state.** The DB reflects the JS catalog, never the other way around. Any DB column that tracks activation state independently of the JS catalog is a second source of truth and must be removed (see migration `20260519000002_sync_activation_from_js.sql`).

## Rationale

- **CI without DB:** The full 29-suite test suite runs against in-memory repositories. No `DATABASE_URL` is required for CI — tests are fast, hermetic, and have zero external dependencies.
- **Graceful cold-start:** If `DATABASE_URL` is misconfigured or Supabase is temporarily unavailable, the server starts anyway (in-memory mode) and the health endpoint returns `checks.db: "not_configured"`. Engineers can diagnose without a DB.
- **Dual-path is low cost:** The Postgres repository implements the same interface as the in-memory one. Switching is a matter of passing a `context.query` function.
- **Test coverage:** The in-memory repository exercises the same service logic as the Postgres path. The T2-05 integration test suite covers the Postgres-specific SQL.

## Implementation Detail

```
resolveRepository(context):
  if context.executionRepository   → use that (test injection)
  if context.query / context.db.query / context.pg.query  → PostgresRepository(context)
  else  → defaultExecutionRepository (singleton in-memory)
```

The singleton in-memory repository is reset between tests via `resetExecutionServiceState()`.

## Alternatives Considered

| Option | Rejected Because |
|---|---|
| Always require Postgres | CI would need a real DB or Docker; complex setup; slow tests |
| SQLite as in-process DB | Adds a native module dep (better-sqlite3); build complexity on Render |
| Prisma / Drizzle ORM | Adds deps, build step, migration tooling overlap with existing Supabase migrations |

## Consequences

- **Positive:** Fast CI, resilient cold-starts, no external DB required for local dev.
- **Negative:** In-memory data is wiped on every Render restart (every 15-minute inactivity spin-down on free tier). This is acceptable for the current phase; persistent data requires `DATABASE_URL` to be configured.
- **Risk:** In-memory and Postgres paths can diverge if a bug is fixed in one but not the other. Mitigation: T2-05 integration tests exercise the Postgres path in CI with a Docker Postgres instance.

## Review Trigger

Revisit if: (1) the in-memory/Postgres divergence becomes a maintenance burden; (2) SQLite becomes the preferred local dev DB; (3) a persistent background job queue is added (Tier 3) that requires a shared backing store.
