-- Smoke-test queries for the v2 pipeline Postgres helpers.
-- Run after applying migration 20260425_pipeline_v2_routing.
-- Usage: cat scripts/v2-smoke.sql | psql "$DATABASE_URL"

-- 1. Function returns expected per-tier caps
SELECT
  dragonmadeit_tier_monthly_quota('FREE')        AS free_should_be_4,
  dragonmadeit_tier_monthly_quota('CREATOR')     AS creator_should_be_20,
  dragonmadeit_tier_monthly_quota('STUDIO')      AS studio_should_be_40,
  dragonmadeit_tier_monthly_quota('STUDIO_PRO')  AS pro_should_be_100,
  dragonmadeit_tier_monthly_quota('SCHEDULER')   AS sched_should_be_0,
  dragonmadeit_tier_monthly_quota('CLIPPER')     AS clip_should_be_0,
  dragonmadeit_tier_monthly_quota('AGENCY')      AS agency_should_be_9999,
  dragonmadeit_tier_monthly_quota('UNKNOWN')     AS bogus_should_be_0;

-- 2. View returns one row per TikTokAccount with current-month count
SELECT
  COUNT(*) AS account_count,
  SUM(posted_this_month) AS total_generated_this_month
FROM account_monthly_usage;

-- 3. Joining the view + function gives "remaining quota" per account
SELECT
  ta.id,
  ta.tier,
  ta."pipelineVersion",
  COALESCE(u.posted_this_month, 0) AS used,
  dragonmadeit_tier_monthly_quota(ta.tier::TEXT) AS cap,
  GREATEST(
    0,
    dragonmadeit_tier_monthly_quota(ta.tier::TEXT) - COALESCE(u.posted_this_month, 0)
  ) AS remaining
FROM "TikTokAccount" ta
LEFT JOIN account_monthly_usage u ON u."tiktokAccountId" = ta.id
ORDER BY ta.tier, ta."createdAt"
LIMIT 20;

-- 4. CHECK constraint blocks invalid videoGenStatus values
DO $$
BEGIN
  BEGIN
    INSERT INTO "TikTokAccount" (id, username, "userId", "videoGenStatus", "updatedAt")
    VALUES ('smoke-check-bad-status', 'smoke', (SELECT id FROM "User" LIMIT 1), 'BOGUS', NOW());
    RAISE EXCEPTION 'CHECK constraint failed to block invalid status';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK: CHECK constraint blocked BOGUS status as expected';
  END;
  -- Cleanup: nothing to delete since the INSERT was rolled back by the constraint
END $$;
