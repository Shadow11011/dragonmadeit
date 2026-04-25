-- Tighten videoGenStatus to NOT NULL.
-- The CHECK constraint added in 20260425_pipeline_v2_routing only enforces
-- IN ('IDLE','GENERATING','FAILED') — but a stray UPDATE setting NULL would
-- silently bypass it (NULL passes any IN check). With every existing row
-- already non-null and a default of 'IDLE', tightening here closes the
-- loophole permanently.
--
-- Verified before this migration: SELECT COUNT(*) FROM "TikTokAccount"
-- WHERE "videoGenStatus" IS NULL; returned 0.

ALTER TABLE "TikTokAccount"
  ALTER COLUMN "videoGenStatus" SET NOT NULL;
