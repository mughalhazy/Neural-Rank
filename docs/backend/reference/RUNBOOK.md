# Neural Rank — Operational Runbook

**Service:** `neural-rank-backend` · Render free tier
**Health URL:** `https://neural-rank-backend.onrender.com/v1/health`
**Dashboard:** Render dashboard → Services → neural-rank-backend
**Supabase:** `https://supabase.com/dashboard/project/bvujfwwwwzlpsxbshxyn`
**On-call contact:** `synteracloud@gmail.com`

---

## Scenario 1 — Cold-start latency (high response time on first request)

**Symptom:** First request after ~15 minutes takes 10–30 seconds.

**Cause:** Render free tier spins down after 15 minutes of inactivity. The cold-start loads Node.js, initialises all 18 modules, and probes the DB.

**Resolution:**
1. This is expected on free tier. Upgrade to Render Starter ($7/month) to eliminate spin-down.
2. To mitigate: configure UptimeRobot (T2-17) to ping `/health` every 5 minutes — prevents spin-down and keeps Supabase from pausing.
3. If UptimeRobot is already configured and latency still occurs: check Render logs for `db_connect_failed` which would indicate DB cold-start adding to the delay.

**Note:** The `/health` DB probe (`SELECT 1`) also prevents Supabase from pausing after 7 days of inactivity. **Do not disable the UptimeRobot monitor.**

---

## Scenario 2 — DB unreachable (`/health` returns 503)

**Symptom:** `GET /health` returns `{ "data": { "deployable": false, "checks": { "db": "fail" } } }` with HTTP 503.

**Cause:** Supabase DB is paused, unreachable, or connection pool exhausted.

**Steps:**
1. Check Supabase dashboard — look for "Database paused" banner. If paused, click **Resume database**.
2. Supabase pauses free tier projects after 7 days of inactivity. UptimeRobot pings should prevent this. If UptimeRobot was disabled, resume manually.
3. If not paused: check Render logs (`Logs` tab in Render dashboard) for `db_connect_failed` with a reason string.
4. If reason is `too many connections`: the pool (max 5) is exhausted. Restart the Render service via Render dashboard → Manual Deploy → `Restart`.
5. After resume: `GET /health` should return `{ "checks": { "db": "pass" } }` within 30 seconds.

**When DB is down:** The server continues to run in in-memory mode. Execution data created during the outage is NOT persisted — it is lost on restart.

---

## Scenario 3 — SERP provider rate-limited

**Symptom:** `serp_feature_analyzer` module returns `{ status: "error", reason: "serp_rate_limit_exceeded" }` or `integration_not_connected`.

**Steps:**
1. Check the SERP provider dashboard (SerpApi or DataForSEO) for quota usage.
2. SerpApi free tier: 100 searches/month. If exhausted, searches resume on the 1st of next month.
3. If using DataForSEO: check credits balance.
4. Temporary fix: set `SERP_PROVIDER` env var to the alternative provider in Render dashboard, then trigger a Manual Deploy.
5. The `serp_feature_analyzer` module degrades gracefully — other 16 modules continue to produce results.

---

## Scenario 4 — Supabase outage

**Symptom:** All write endpoints return 503 `auth_service_unavailable` or DB errors cascade.

**Cause:** Supabase platform outage (check `https://status.supabase.com`).

**Steps:**
1. Check `https://status.supabase.com` — if there is an active incident, wait for resolution.
2. Auth failures (JWT verification): `verifySupabaseToken` throws `auth_service_unavailable` (503) rather than 401 so clients can distinguish outage from invalid token. Clients should retry with exponential backoff.
3. DB failures: health endpoint returns 503. Server continues in in-memory mode for read-only operations.
4. No action needed from the operator during a Supabase platform outage — the service degrades gracefully and recovers automatically when Supabase comes back.

---

## Scenario 5 — Force restart Render

**When to use:** After environment variable changes, after `npm audit fix`, after a broken deployment.

**Steps:**
1. Go to Render dashboard → Services → `neural-rank-backend`.
2. Click **Manual Deploy** → **Deploy latest commit** (re-runs build + start).
3. Or use the Render API: `curl -X POST https://api.render.com/v1/services/<serviceId>/deploys -H "Authorization: Bearer <render-api-key>"`.
4. Monitor the deploy logs for `db_connected` or `db_skipped` to confirm DB status.
5. Verify with `GET /health` returning `{ "deployable": true }`.

---

## Scenario 6 — Credential rotation

**When to rotate:** After a suspected breach, after a team member leaves, or as scheduled maintenance.

**Credentials to rotate:**

| Credential | Location | How to rotate |
|---|---|---|
| `SUPABASE_URL` | Render dashboard (sync: false) | Project settings never change; `SUPABASE_URL` is stable |
| `SUPABASE_ANON_KEY` | Render dashboard (sync: false) | Supabase dashboard → Settings → API → Regenerate anon key → update Render → redeploy |
| `DATABASE_URL` | Render dashboard (sync: false) | Supabase dashboard → Settings → Database → Reset database password → update Render → redeploy |
| `SERP_API_KEY` | Render dashboard (sync: false) | SERP provider dashboard → regenerate key → update Render → redeploy |
| `SENTRY_DSN` | Render dashboard (sync: false) | Sentry dashboard → Project → Client Keys → Regenerate → update Render → redeploy |

**Rotation procedure:**
1. Generate new credential in the source dashboard.
2. Update the value in Render dashboard → Environment → Edit the relevant env var.
3. Trigger a Manual Deploy to pick up the new value.
4. Verify `/health` returns `{ "deployable": true }` after deploy completes.
5. Revoke the old credential in the source dashboard.
6. Update `progress.md` with the rotation date.

**Never commit credentials:** All production credentials live exclusively in the Render dashboard (`sync: false` in `render.yaml`). The `.env.example` file contains only placeholder values.

---

## Audit log correction procedure

Audit log rows are immutable by DB trigger — `UPDATE` and `DELETE` raise `audit_log_rows_are_immutable`. To "correct" an audit log entry, insert a new row with:
```json
{
  "action": "correction",
  "payload": {
    "corrects": "<original-audit-log-id>",
    "reason": "human-readable explanation"
  }
}
```
This preserves the append-only audit trail while documenting the correction.
