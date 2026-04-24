-- Tier ladder redesign: swap the 4-value fire-dragon tier enum
-- (FREE, HATCHLING, DRAKE, ELDER_DRAGON) for the 7-value Mode-Based enum
-- (FREE, SCHEDULER, CREATOR, CLIPPER, STUDIO, STUDIO_PRO, AGENCY).
--
-- Postgres does not let you drop enum values in place, so we recreate the
-- type and remap existing rows. Data backfill:
--   FREE         -> FREE
--   HATCHLING    -> CREATOR     (closest match: generate-only at $19)
--   DRAKE        -> STUDIO      (bundled generation + scheduling path)
--   ELDER_DRAGON -> STUDIO_PRO  (premium bundle, closest to old premium)
--
-- Tables that use the Tier enum: TikTokAccount.tier, DeviceFingerprint.tier.
-- Run everything in a single transaction so a partial failure rolls back.

BEGIN;

-- 1. Create the new enum type under a temp name.
CREATE TYPE "Tier_new" AS ENUM (
  'FREE',
  'SCHEDULER',
  'CREATOR',
  'CLIPPER',
  'STUDIO',
  'STUDIO_PRO',
  'AGENCY'
);

-- 2. Retype TikTokAccount.tier. Drop the default first because it references
--    the old type, then re-add it after the cast.
ALTER TABLE "TikTokAccount" ALTER COLUMN "tier" DROP DEFAULT;

ALTER TABLE "TikTokAccount"
  ALTER COLUMN "tier" TYPE "Tier_new"
  USING (
    CASE "tier"::text
      WHEN 'FREE' THEN 'FREE'
      WHEN 'HATCHLING' THEN 'CREATOR'
      WHEN 'DRAKE' THEN 'STUDIO'
      WHEN 'ELDER_DRAGON' THEN 'STUDIO_PRO'
    END
  )::"Tier_new";

ALTER TABLE "TikTokAccount" ALTER COLUMN "tier" SET DEFAULT 'FREE';

-- 3. Retype DeviceFingerprint.tier (no default on this one, but same cast).
ALTER TABLE "DeviceFingerprint"
  ALTER COLUMN "tier" TYPE "Tier_new"
  USING (
    CASE "tier"::text
      WHEN 'FREE' THEN 'FREE'
      WHEN 'HATCHLING' THEN 'CREATOR'
      WHEN 'DRAKE' THEN 'STUDIO'
      WHEN 'ELDER_DRAGON' THEN 'STUDIO_PRO'
    END
  )::"Tier_new";

-- 4. Swap the types: drop the old, rename the new to "Tier".
DROP TYPE "Tier";
ALTER TYPE "Tier_new" RENAME TO "Tier";

COMMIT;
