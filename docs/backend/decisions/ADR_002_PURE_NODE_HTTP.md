# ADR 002 — Pure node:http Server (No Framework)

**Date:** 2026-05-15
**Status:** Accepted
**Dimension:** Architecture · Scalability · Developer Experience

---

## Context

The backend needs an HTTP server. The choice is between Node.js built-in `node:http`, a lightweight framework (Hono, Polka), or a full framework (Express, Fastify, NestJS).

## Decision

The server is built directly on **`node:http`** with no framework layer. All routing is implemented in `backend/src/server.js` as explicit `if/else` pathname matching.

## Rationale

- **Consistency with ADR 001 (zero runtime deps):** Adding any framework violates the zero-dep constraint. The routing table is small (24 routes) and does not justify a framework's abstraction overhead.
- **Full control:** Every middleware step (CORS headers, rate limiting, auth, body parsing, request logging) is a named function in `server.js`. The execution path is unambiguous — no hidden middleware stack.
- **Performance:** Direct pathname string matching is microseconds vs. framework regex routing at the current route count.
- **Testability:** `createServer()` returns a plain `node:http.Server`. Tests call `server.listen(0)` and make real HTTP requests — no mock frameworks, no supertest, no dependency.

## Routing Pattern

```
createRequestHandler(baseContext)
  → OPTIONS preflight (early return)
  → resolveRequestIdentity (JWT verification)
  → explicit if/else per pathname (or regex for parameterised routes)
  → domain handler functions
  → sendEnvelope (unified response format)
```

## Alternatives Considered

| Option | Rejected Because |
|---|---|
| Express 4 | Would satisfy ADR 001 violation; middleware magic obscures execution path |
| Fastify | Schema-based routing is powerful but adds dep complexity for 24 routes |
| Hono | Good choice at scale but not needed; adds a dep |
| Polka | Minimal; would reduce boilerplate but still a dep |

## Consequences

- **Positive:** Zero framework overhead, full control, directly testable, consistent with zero-dep policy.
- **Negative:** Routing boilerplate is verbose. Parameterised routes require regex matching (`/^\/execution\/recommendations\/([^/]+)\/status$/`). Adding a route requires touching `createRequestHandler` and `AVAILABLE_ROUTES`.
- **Mitigation:** The `AVAILABLE_ROUTES` array at the top of `server.js` is the authoritative route list. New routes must be added there. The routing pattern is consistent and easy to follow.

## Review Trigger

Revisit if route count exceeds 50 or if significant middleware needs (streaming, WebSocket, multipart upload) emerge that would require substantial custom implementation.
