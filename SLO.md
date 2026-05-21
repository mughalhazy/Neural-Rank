# Neural Rank — Service Level Objectives

**Service:** `neural-rank-backend` · Render free tier
**Effective date:** 2026-05-19
**Review date:** 2026-06-19 (30 days of production data)

**Depends on:** T3-03 (Prometheus metrics for measurement), T3-08 (staging), T2-17 (UptimeRobot uptime data)

---

## SLO 1 — Availability

**Target:** 99.5% uptime per calendar month

**Allowed downtime:** ~3.6 hours per month

**Measurement:** UptimeRobot 5-minute health checks on `GET /v1/health`. A check is "up" when it returns HTTP 200 within the probe timeout. "Downtime" = all consecutive failed checks × 5 minutes.

**Free-tier note:** Render free tier spins down after 15 minutes of inactivity. UptimeRobot pings every 5 minutes to prevent spin-down. If UptimeRobot is unconfigured, the effective availability will be lower. A single cold-start event does not count as downtime unless the service fails to respond within 60 seconds.

**Breach consequence:** Investigate Render logs and Supabase status. Document the incident in `progress.md` with duration, cause, and resolution.

---

## SLO 2 — Latency

### 2a — Health endpoint

**Target:** p99 `GET /v1/health` < 500 ms (excluding cold-start)

**Measurement:** Prometheus histogram at `GET /v1/metrics` — bucket `http_request_duration_ms{route="/v1/health"}`. Cold-start requests (first request after a spin-down) are excluded from the p99 calculation.

### 2b — Module run endpoint

**Target:** p99 `POST /v1/run/default` < 20 000 ms

**Rationale:** 17 modules run sequentially; external adapters may take 1–3 s each. A 20 s p99 gives headroom for the slowest adapter while flagging systemic slowdowns. This target will tighten after T3-01 (async queue) reduces the synchronous path.

**Measurement:** Prometheus histogram at `GET /v1/metrics` — bucket `http_request_duration_ms{route="/v1/run/default"}`.

---

## SLO 3 — Error Rate

**Target:** < 0.5% 5xx responses per rolling 24-hour window

**Measurement:** `http_error_total{status="5xx"}` / `http_request_total` over a 24-hour rolling window from Prometheus at `GET /v1/metrics`.

**Exclusions:** 503 responses from `GET /v1/health` when the DB is intentionally paused are excluded from the 5xx error budget (the service is operating correctly in degraded mode).

**Breach consequence:** Investigate `api_error` log entries in Render logs. Check Sentry for unhandled exceptions.

---

## SLO 4 — Module Execution Success Rate

**Target:** < 1% module `timeout` status per rolling 24-hour window (of all module runs)

**Measurement:** Module results with `status: "timeout"` / total module results. Tracked via `module_timeout_total` counter in Prometheus.

**Rationale:** Each module has a 10-second timeout guard (`runModuleSafe`). Timeouts above 1% indicate a consistently slow or broken adapter.

---

## Error Budget Policy

| SLO | Budget / month | Alert threshold |
|---|---|---|
| Availability | 3.6 hrs downtime | Alert when > 1.8 hrs consumed |
| p99 latency `/v1/health` | N violations (< 0.5% of checks) | Alert when p99 > 300 ms over 1-hr window |
| p99 latency `/v1/run/default` | N violations (< 0.5% of requests) | Alert when p99 > 12 000 ms over 1-hr window |
| 5xx error rate | 0.5% of requests | Alert when error rate > 0.25% over 1-hr window |

Grafana alerts at 50% error budget consumption are configured as part of T3-03 (Prometheus + Grafana dashboard). Until T3-03 is complete, SLO tracking is manual via UptimeRobot uptime reports and Render log analysis.

---

## Review Process

SLOs are reviewed after:
- 30 days of production data (2026-06-19)
- Any availability breach > 1 hour
- After T3-01 (async queue) deployment — `/v1/run/default` latency target will tighten

Tightened targets after review are recorded in this file with an effective date.

---

## Non-Goals

This document does not define:
- SLAs (contractual service agreements with users)
- Flutter app performance SLOs
- Database query-level SLOs (covered by connection pool monitoring in T3-09)
