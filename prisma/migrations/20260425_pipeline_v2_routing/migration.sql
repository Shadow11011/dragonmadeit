-- Pipeline v2 routing + Postgres-as-the-contract helpers.
-- Adds pipelineVersion + videoGenStartedAt on TikTokAccount, source +
-- errorMessage on ContentItem, the VideoSource enum, the per-tier monthly
-- quota function, the account_monthly_usage view, and CHECK constraints
-- on the soft-typed pipelineVersion + videoGenStatus columns.

-- 1. Enum: VideoSource ---------------------------------------------------------
CREATE TYPE "VideoSource" AS ENUM ('GENERATED', 'UPLOADED');

-- 2. TikTokAccount columns ----------------------------------------------------
ALTER TABLE "TikTokAccount"
  ADD COLUMN "pipelineVersion"   TEXT      NOT NULL DEFAULT 'v1',
  ADD COLUMN "videoGenStartedAt" TIMESTAMP(3);

-- Index tuned for the v2 orchestrator's poll predicate.
-- Note: column order is fine for the canary window (pipelineVersion='v2' is
-- highly selective while v2 is rare). Post-backfill, consider reordering to
-- (nextPostAt, pipelineVersion, videoGenStatus) for steady-state shape.
CREATE INDEX "TikTokAccount_pipelineVersion_videoGenStatus_nextPostAt_idx"
  ON "TikTokAccount" ("pipelineVersion", "videoGenStatus", "nextPostAt");

-- 3. ContentItem columns ------------------------------------------------------
ALTER TABLE "ContentItem"
  ADD COLUMN "source"       "VideoSource" NOT NULL DEFAULT 'GENERATED',
  ADD COLUMN "errorMessage" TEXT;

-- 4. Soft enums: CHECK constraints --------------------------------------------
-- v1 currently uses 'IDLE' and 'GENERATING'. v2 adds 'FAILED' for terminal
-- failure states the reaper or pipeline can mark.
ALTER TABLE "TikTokAccount"
  ADD CONSTRAINT "TikTokAccount_videoGenStatus_valid"
  CHECK ("videoGenStatus" IN ('IDLE', 'GENERATING', 'FAILED'));

-- pipelineVersion is a soft routing flag. Lock it to known values so a typo
-- in cutover SQL (e.g., UPDATE ... SET pipelineVersion = 'v22') doesn't
-- silently strand accounts that no orchestrator polls for.
ALTER TABLE "TikTokAccount"
  ADD CONSTRAINT "TikTokAccount_pipelineVersion_valid"
  CHECK ("pipelineVersion" IN ('v1', 'v2'));

-- 5. Per-tier monthly quota function -----------------------------------------
-- Single source of truth for "how many generated videos per month does this
-- tier get". Mirrors src/types/index.ts TIER_CONFIG. Update both together.
CREATE OR REPLACE FUNCTION dragonmadeit_tier_monthly_quota(tier TEXT)
RETURNS INTEGER
LANGUAGE SQL IMMUTABLE
AS $$
  SELECT CASE tier
    WHEN 'FREE'        THEN 4
    WHEN 'SCHEDULER'   THEN 0     -- scheduler tier does not generate
    WHEN 'CREATOR'     THEN 20
    WHEN 'CLIPPER'     THEN 0     -- clipper tier uses repurpose, not generate
    WHEN 'STUDIO'      THEN 40
    WHEN 'STUDIO_PRO'  THEN 100
    WHEN 'AGENCY'      THEN 9999  -- effectively unlimited; real cap is contractual
    ELSE 0
  END;
$$;

-- 6. View: account_monthly_usage ---------------------------------------------
-- Counts ContentItem rows in the current calendar month (UTC) per account,
-- only for GENERATED source (UPLOADED items don't burn the generate quota).
-- PROCESSING + POSTED both count — once we start, the cost is sunk and the
-- user has consumed one of their monthly quota slots even if posting fails.
CREATE OR REPLACE VIEW account_monthly_usage AS
SELECT
  ta.id                                AS "tiktokAccountId",
  ta.tier                              AS tier,
  COUNT(ci.id) FILTER (
    WHERE ci."source" = 'GENERATED'
      AND ci.status IN ('PROCESSING', 'POSTED')
      AND ci."createdAt" >= date_trunc('month', NOW() AT TIME ZONE 'UTC')
  )::INTEGER                           AS posted_this_month
FROM "TikTokAccount" ta
LEFT JOIN "ContentItem" ci ON ci."tiktokAccountId" = ta.id
GROUP BY ta.id, ta.tier;

-- 7. Backfill: existing rows already match defaults -------------------------
-- pipelineVersion defaulted to 'v1' (correct for legacy rows).
-- source defaulted to 'GENERATED' (correct for all current ContentItems —
-- the UPLOADED capability ships in Phase 1.6, not yet active).
-- No additional UPDATE needed.
