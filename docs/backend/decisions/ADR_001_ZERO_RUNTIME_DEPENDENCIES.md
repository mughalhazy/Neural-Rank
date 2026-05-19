# ADR 001 — Zero Runtime npm Dependencies

**Date:** 2026-05-15
**Status:** Accepted
**Dimension:** Architecture · Developer Experience · Security

---

## Context

Neural Rank's backend needs to run on the Render free tier (512 MB RAM, cold-start after 15 min inactivity). The team evaluates whether to adopt a framework (Express, Fastify, Hono) and whether to use npm packages for utilities.

## Decision

The production backend has **zero runtime npm dependencies**. All server, routing, JSON serialisation, crypto, and HTTP client logic uses Node.js built-in modules only.

DevDependencies (ESLint, c8, Husky) are permitted — they never ship to production.

The one documented exception: if Sentry is integrated via the npm SDK rather than the zero-dep HTTP reporter in `core/errorReporter.js`, `@sentry/node` would become a runtime dependency. The current implementation avoids this via direct HTTPS POST to the Sentry store API.

## Rationale

- **Attack surface:** Every npm package is a supply-chain attack vector. Zero runtime dependencies means zero package CVEs in production.
- **Cold-start latency:** Render free tier cold-starts with no module cache. With zero dependencies, `require()` tree resolves in milliseconds. Each additional 1 MB of `node_modules` adds ~20–40 ms to a cold start.
- **Auditability:** A human can read every line of code that runs in production. No black-box behaviour hidden in a package.
- **Stability:** No upstream breakage from breaking changes in a dependency. `node:http`, `node:crypto`, `node:url` are stable across Node.js LTS versions.

## Alternatives Considered

| Option | Rejected Because |
|---|---|
| Express 4 | Adds 50+ transitive deps; cold-start penalty; not needed for 24 routes |
| Fastify | Faster than Express but still ~120 npm packages; overkill for current scale |
| Hono | Newer; fewer packages; still a dependency chain; adds upgrade maintenance |
| `node-fetch` / `axios` | `node:https` is sufficient for the adapter pattern; avoids a dep |

## Consequences

- **Positive:** Minimal attack surface, fast cold-starts, no dependency CVEs, full auditability.
- **Negative:** More boilerplate for routing, JSON parsing, and HTTP client calls. Developers new to the codebase must understand raw `node:http` patterns.
- **Mitigation:** The `server.js` routing pattern is documented in `BACKEND_MASTER_SPEC.md`; the pattern is consistent across all 24 routes.

## Review Trigger

Revisit this decision if: (1) the route count exceeds 50 and routing boilerplate becomes a maintenance burden; (2) middleware needs (auth, tracing, body parsing) proliferate; (3) the team grows to 5+ backend engineers who are unfamiliar with raw Node.js HTTP.
