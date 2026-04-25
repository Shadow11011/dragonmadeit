# Pipeline v2 (parallel hardened pipeline)

These three workflows are a hardened rewrite of the v1 generate pipeline. They live alongside the v1 workflows (`mt5BR1Jn3F4oFpON.json`, `mpG2ZhLjRCi7ppyw.json`, `nsVYG0dCGX1gEJlH.json`) and run only against `TikTokAccount` rows where `pipelineVersion = 'v2'`.

## What v2 fixes vs v1

| # | Gap (v1) | Fix (v2) |
|---|----------|---------|
| 1 | SELECT-then-UPDATE lock can double-claim under concurrent runs | Single atomic claim with `FOR UPDATE SKIP LOCKED` |
| 2 | No watchdog for stuck `GENERATING` accounts | `Reaper` node runs first each tick, unsticks anything >20min |
| 3 | `ContentItem` row created late, no audit trail for failed generations | `Create ContentItem (Early)` runs right after Prepare Job; downstream nodes UPDATE the row |
| 4 | FREE-tier watermark + end_card never sent to media-api | Caption node payload includes `watermark` + `end_card` set from `tier === 'FREE'` |
| 5 | Quota enforcement only at API layer; orchestrator never gates | Claim SQL joins `account_monthly_usage` view + `dragonmadeit_tier_monthly_quota()` function |
| 6 | n8n SQL and TypeScript drift apart | Business rules live in Postgres helpers (function + view); both n8n and Vercel read the same source |
| 7 | `videoGenStatus` is loose string with no DB-side validation | CHECK constraints on `videoGenStatus` (IDLE/GENERATING/FAILED) and `pipelineVersion` (v1/v2) |

The Postgres helpers are created by migration `20260425_pipeline_v2_routing`.

## Files

| File | Workflow name | Purpose |
|------|--------------|---------|
| `orchestrator-v2.json` | DragonMadeIt — Orchestrator v2 | Reaper → atomic claim → switch → gameplay-v2 / ai-images-v2 |
| `gameplay-v2.json` | DragonMadeIt — Gameplay Pipeline v2 | Generate gameplay-style faceless video, post via Late |
| `ai-images-v2.json` | DragonMadeIt — AI Images Pipeline v2 | Generate AI-image video, post via Late |

All three ship with `active: false` and no root `id` (n8n auto-assigns on import — no risk of overwriting v1).

## Pre-cutover prerequisite (CRITICAL)

**v1 does NOT filter by `pipelineVersion`.** v1's orchestrator (`mt5BR1Jn3F4oFpON.json`) selects every IDLE account regardless of which pipeline owns it. The moment you flip a row to `pipelineVersion = 'v2'`, both v1 AND v2 will race to claim it — v1 because it doesn't filter, v2 because that's its purpose. v1's lock is non-atomic (SELECT-then-UPDATE), so v1 will likely win the race some of the time and process the canary account with v1's unfixed bugs.

**Before flipping any account to `pipelineVersion = 'v2'`, you MUST deactivate v1 in n8n.**

Two options:
1. **Cleanest:** deactivate the v1 Orchestrator workflow in n8n's UI (toggle off `DragonMadeIt — Orchestrator`). v1's sub-pipelines (`Gameplay Pipeline`, `AI Images Pipeline`) can stay enabled — only the orchestrator polls.
2. **Safer for partial cutover:** patch v1's `Get Accounts Needing Videos` query to add `AND ("pipelineVersion" = 'v1' OR "pipelineVersion" IS NULL)`. This lets v1 keep running for non-v2 accounts during the canary window. Only do this if you actually need to keep generating for v1 accounts during canary — most operators will deactivate v1 entirely.

If you skip this step, v1 will silently double-process canary accounts using its own unfixed bugs, and the canary results will be unreliable.

## Cutover playbook

1. **Apply migration** (one-time, ships with the v2 workflows):
   ```bash
   npx prisma migrate deploy
   ```

2. **Import workflows into n8n** (one-time):
   - Open n8n at https://n8n.shadow11011.theworkpc.com
   - Workflows → Import from File → pick each of the three JSONs
   - Re-link the Postgres credential in all THREE workflows (search for `REPLACE_WITH_POSTGRES_CRED_ID` — it appears in orchestrator-v2 + both sub-workflows after this commit's credential cleanup) — either re-select the Supabase Postgres credential via n8n's UI on each Postgres node, or search-and-replace the placeholder string with your real credential ID before import.
   - In `orchestrator-v2`, search for `REPLACE_WITH_GAMEPLAY_V2_WORKFLOW_ID` and `REPLACE_WITH_AI_IMAGES_V2_WORKFLOW_ID` and replace each with the n8n-assigned workflow ID of the matching sub-workflow (visible in the URL bar of each sub-workflow page after import). A search-and-replace before import is faster than clicking through n8n's UI for each.
   - Leave the orchestrator-v2 in **inactive** state until you're ready to canary

3. **Deactivate v1 (per the prerequisite above).**

4. **Canary one account**:
   ```sql
   -- Verify the target before flipping (avoid fat-fingering the wrong UUID):
   SELECT id, tier, "pipelineVersion", "videoGenStatus", username
   FROM "TikTokAccount" WHERE id = '<test-account-id>';
   ```
   ```sql
   -- Pick a personal test account (Don's own FREE account is the natural pick)
   UPDATE "TikTokAccount" SET "pipelineVersion" = 'v2'
   WHERE id = '<test-account-id>';
   ```
   Activate `Orchestrator v2` in n8n. The next 30-min tick will pick up the v2 account. v1 is deactivated, so v2 has the row to itself.

5. **Verify the canary worked**:

   **Database checks (psql, observable immediately):**
   - `ContentItem` row appears with `status = 'PROCESSING'` shortly after the orchestrator tick (early-create from gameplay-v2/ai-images-v2 lands BEFORE generation starts)
   - Mid-pipeline, `Update ContentItem Title` writes the real script title onto that row (no more "Auto-generated (in progress)" placeholder)
   - Status flips to `'POSTED'` (or `'FAILED'` with `errorMessage` populated) within 20 minutes
   - `videoGenStatus` returns to `'IDLE'`, `videoGenStartedAt` is NULL, `nextPostAt` advances by `1 week / videosPerWeek`, `lastPostedAt = NOW()`

   **Visual check (manual, requires opening the post on TikTok):**
   - For FREE tier specifically: open the posted video, confirm the `dragonmadeit.app` watermark is visible near the bottom and the end card plays after the main video. The media-api at `/home/dragon/services/media-api/server.py` already implements both — v2 just sends the `watermark: true` and `end_card: true` flags v1 never did.

6. **Watch for failure modes**:
   - If `Create ContentItem` ever fails (DB blip), `onError: continueErrorOutput` routes to `Reset Account On Error`, the account exits `GENERATING` immediately, and the run aborts cleanly. Look for `videoGenStatus = 'IDLE'` with no `ContentItem.status = 'POSTED'` row in the next minute.
   - If a sub-pipeline gets stuck mid-flight, the Reaper unsticks accounts >20min old at the next orchestrator tick, plus marks any orphan `PROCESSING` ContentItems as `FAILED` with `errorMessage = 'reaped: pipeline did not finish within 20 minutes'`.

**If no `ContentItem` row appears after 30 min:**

The orchestrator may not have ticked, or the claim found no eligible row. Check:

```sql
-- Did the canary account actually flip to v2?
SELECT id, "pipelineVersion", "videoGenStatus", "nextPostAt", "videoGenStartedAt"
FROM "TikTokAccount" WHERE id = '<canary-id>';

-- Is the row eligible for the v2 claim right now?
SELECT a.id, a."nextPostAt" <= NOW() AS due, a."videoGenStatus", a."videosPerWeek",
       a."lateAccountId" IS NOT NULL AS has_late_account,
       COALESCE(u.posted_this_month, 0) AS used,
       dragonmadeit_tier_monthly_quota(a.tier::TEXT) AS cap
FROM "TikTokAccount" a
LEFT JOIN account_monthly_usage u ON u."tiktokAccountId" = a.id
WHERE a.id = '<canary-id>';
```

If `due = false`, push `nextPostAt` to NOW() to trigger the next tick:
`UPDATE "TikTokAccount" SET "nextPostAt" = NOW() WHERE id = '<canary-id>';`

If `has_late_account = false`, the account isn't fully linked — claim's WHERE clause requires `lateAccountId` to be set.

If `used >= cap`, the account already exhausted its monthly quota.

Otherwise, check n8n's "Executions" tab for the v2 orchestrator — the cron may not have run, the workflow may not be activated, or the Postgres credential may be misconfigured.

7. **Backfill all rows once confident** (typically after ≥4 generations on the canary, ideally a full month):
   ```sql
   UPDATE "TikTokAccount" SET "pipelineVersion" = 'v2';
   ```
   v2 now serves all accounts. v1 stays deactivated.

8. **Decommission v1** (only after v2 has run cleanly for >2 weeks across all accounts):
   - Delete v1 workflows in n8n (or leave inactive as a frozen reference)
   - The v1 JSON files in `n8n/workflows/` stay in git as historical record

## Rollback

If v2 misbehaves on the canary:

```sql
UPDATE "TikTokAccount" SET "pipelineVersion" = 'v1' WHERE "pipelineVersion" = 'v2';
```

To roll back ONLY one misbehaving account (leaving the rest of the canary on v2):

```sql
UPDATE "TikTokAccount" SET "pipelineVersion" = 'v1' WHERE id = '<bad-account-id>';
```

Deactivate v2 orchestrator in n8n. Reactivate v1 orchestrator. v1 picks the account back up on its next tick.

The only artifact is whatever in-flight ContentItem v2 may have created (status = `PROCESSING`). The v2 reaper would catch this within 20 min, but with v2 deactivated nothing is reaping. Manually mark it FAILED:

```sql
UPDATE "ContentItem"
SET status = 'FAILED',
    "errorMessage" = 'rollback to v1: v2 in-flight aborted',
    "updatedAt" = NOW()
WHERE status = 'PROCESSING'
  AND "createdAt" < NOW() - INTERVAL '5 minutes';
```

## Full Postgres rollback (worst case — undo migration)

If the Phase 1 migration `20260425_pipeline_v2_routing` itself needs to be undone (e.g., upstream schema rollback):

**Before running these DROPs**, Preserve forensics if you may need them later:

```bash
pg_dump --table='"ContentItem"' "$DATABASE_URL" > pre-rollback-contentitem.sql
```

The DROPs will permanently destroy any `errorMessage` text written by v2 — that's often the most valuable signal for diagnosing why you needed to roll back.

```sql
-- Drop in reverse-creation order. SAFE if no v2 row exists; destructive if any do.
DROP VIEW IF EXISTS account_monthly_usage;
DROP FUNCTION IF EXISTS dragonmadeit_tier_monthly_quota(TEXT);
ALTER TABLE "TikTokAccount" DROP CONSTRAINT IF EXISTS "TikTokAccount_pipelineVersion_valid";
ALTER TABLE "TikTokAccount" DROP CONSTRAINT IF EXISTS "TikTokAccount_videoGenStatus_valid";
ALTER TABLE "ContentItem" DROP COLUMN IF EXISTS "errorMessage";
ALTER TABLE "ContentItem" DROP COLUMN IF EXISTS "source";
DROP INDEX IF EXISTS "TikTokAccount_pipelineVersion_videoGenStatus_nextPostAt_idx";
ALTER TABLE "TikTokAccount" DROP COLUMN IF EXISTS "videoGenStartedAt";
ALTER TABLE "TikTokAccount" DROP COLUMN IF EXISTS "pipelineVersion";
DROP TYPE IF EXISTS "VideoSource";
-- Mark the migration as not-applied in Prisma's metadata
DELETE FROM "_prisma_migrations" WHERE migration_name = '20260425_pipeline_v2_routing';
```

After this, the schema is back to its pre-migration shape and v1 continues to function unchanged. Don't run this unless you actually need to roll back; the additive nature of v2 means leaving the helpers in place is harmless even if you decide not to use v2.

## Open follow-ups (Minor, post-canary)

These are tracked but deferred — they don't block canary or backfill:

- **n8n execution-history retention.** With `saveDataErrorExecution: "all"` (kept for debugging), error executions retain full payloads. The Atomic Claim's `RETURNING` list is column-scoped to exclude `accessToken`/`refreshToken`, so no secrets are persisted, but consider tightening n8n's prune-after window if execution-table size becomes an issue.
- **MinIO bucket prefix coupling.** Cleanup nodes used to hardcode `/nca-toolkit/` as a substring in the URL splitter. v2 cleanup nodes were updated to a bucket-agnostic `URL().pathname.split('/').slice(2).join('/')` form so renaming the MinIO bucket (e.g. on a future Contabo migration) won't silently leak storage. The legacy v1 cleanup nodes still use the hardcoded substring — fix when revisiting v1 for any reason.

## Updating the snapshot

Same pattern as the v1 directory: export from n8n after every edit, commit the diff. See `/root/dragonmadeit/n8n/workflows/README.md` for the export commands.
