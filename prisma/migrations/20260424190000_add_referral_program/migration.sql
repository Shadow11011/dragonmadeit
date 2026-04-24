-- Task 1.10: Referral program.
--
-- Adds four columns to "User":
--   referralCode           TEXT UNIQUE NOT NULL  — 8-char opaque slug
--   referredByUserId       TEXT NULL             — optional pointer to referrer
--   referralCredits        INT  NOT NULL DEFAULT 0  — cents balance (1000 = $10)
--   referralCreditAppliedAt TIMESTAMP NULL        — idempotency flag set when
--                                                   the referrer's credit fires
--
-- Existing rows must receive a unique referralCode. We add the column NULL-able
-- first, backfill, then add the NOT NULL + UNIQUE constraints. Collision risk
-- on a 32^8 space at current user counts is vanishingly small; the loop below
-- retries per-row until a free code is found to make it watertight.

BEGIN;

-- 1. Add columns (referralCode nullable during backfill).
ALTER TABLE "User" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "User" ADD COLUMN "referredByUserId" TEXT;
ALTER TABLE "User" ADD COLUMN "referralCredits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "referralCreditAppliedAt" TIMESTAMP(3);

-- 2. Backfill referralCode on every existing User row.
--    Generate an 8-char base32 code (no 0/O/1/l collisions). Retry on
--    uniqueness collision so we never leave a NULL.
DO $$
DECLARE
  r RECORD;
  attempt TEXT;
  tries INT;
BEGIN
  FOR r IN SELECT "id" FROM "User" WHERE "referralCode" IS NULL LOOP
    tries := 0;
    LOOP
      -- Build an 8-char code from the alphabet 23456789ABCDEFGHJKMNPQRSTUVWXYZ
      -- (base32 minus 0, 1, I, L, O). Each character picked uniformly at random.
      attempt := '';
      FOR i IN 1..8 LOOP
        attempt := attempt ||
          SUBSTR(
            '23456789ABCDEFGHJKMNPQRSTUVWXYZ',
            (FLOOR(RANDOM() * 31) + 1)::INT,
            1
          );
      END LOOP;
      -- Ensure uniqueness before claiming.
      IF NOT EXISTS (SELECT 1 FROM "User" WHERE "referralCode" = attempt) THEN
        UPDATE "User" SET "referralCode" = attempt WHERE "id" = r."id";
        EXIT;
      END IF;
      tries := tries + 1;
      IF tries > 20 THEN
        RAISE EXCEPTION 'referralCode backfill: exceeded retries for user %', r."id";
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- 3. Lock down the referralCode column: NOT NULL + UNIQUE.
ALTER TABLE "User" ALTER COLUMN "referralCode" SET NOT NULL;
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- 4. Index for "all users referred by X" queries.
CREATE INDEX "User_referredByUserId_idx" ON "User"("referredByUserId");

COMMIT;
