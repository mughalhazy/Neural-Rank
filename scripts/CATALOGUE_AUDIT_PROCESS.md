# DOC_CATALOGUE Purpose Audit — Process Doc

**Started:** 2026-05-23
**Goal:** Add a `Purpose` column to every entry in DOC_CATALOGUE.md — 88 entries (87 .md + 1 .yaml)
**Checkpoint file:** `scripts/catalogue-audit.json`

---

## Column definitions

| Column | Rule |
|--------|------|
| **Purpose** | One sentence — WHY this file exists: its role in the project, who should read it and when |
| **Description** | One sentence — WHAT it contains: the actual content summary a reader finds when they open it |

---

## Process (per batch)

1. Read `scripts/catalogue-audit.json` — filter `"done": false` to find next batch
2. Read each file in the batch **fully** (not excerpts) before writing anything
3. Write `purpose` + `description` into the JSON entry; set `"done": true`
4. Update `meta.entries_done` and `meta.batches_done`
5. Update the corresponding rows in `DOC_CATALOGUE.md`
6. Commit to git — message format: `docs: catalogue audit batch N — entries X–Y`

---

## Resume protocol

If a session ends mid-audit:
1. Read `scripts/catalogue-audit.json`
2. Filter entries where `"done": false` and `"batch"` equals the lowest incomplete batch number
3. Pick up from that batch — no re-reading of `done: true` entries required

---

## Batch plan

| Batch | IDs | Section | Status |
|-------|-----|---------|--------|
| 1 | 1–10 | ops/ gap registers + product planning | **DONE** (2026-05-23) |
| 2 | 11–20 | ops/ runbooks, logs, market research + root docs | **DONE** (2026-05-23) |
| 3 | 21–30 | root docs + docs/backend/reference/ (first 8) | **DONE** (2026-05-23) |
| 4 | 31–40 | docs/backend/reference/ (last 2) + decisions + implementation (first 3) | pending |
| 5 | 41–50 | docs/backend/implementation/ (last 4) + docs/backend/archive/ (first 3) | pending |
| 6 | 51–60 | docs/backend/archive/ (last 7) + docs/frontend/reference/ (first 3) | pending |
| 7 | 61–70 | docs/frontend/reference/ (last 3) + docs/frontend/planning/ + phases (first 1) | pending |
| 8 | 71–80 | docs/frontend/phases/ (last 9) + docs/frontend/archive/ (first 1) | pending |
| 9 | 81–88 | docs/frontend/archive/ (last 6) + logs + app/README.md | pending |

---

## Progress tracker

- Entries done: **30 / 88**
- Batches done: **3 / 9**
- Last commit: `123c32a` (Batch 2) · Batch 3 pending commit
