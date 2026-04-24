-- Dodo Payments migration, phase 2: drop the Paystack columns now that all
-- write/read paths have cut over to Dodo.
--
-- Dropped columns:
--   User.paystackCustomerCode
--   TikTokAccount.paystackSubscriptionCode (with its UNIQUE index)
--   TikTokAccount.paystackEmailToken
--
-- Pre-launch state: three rows in TikTokAccount have non-null
-- paystackSubscriptionCode values left over from test-mode Paystack
-- subscriptions; DROP COLUMN discards them along with the schema.

BEGIN;

-- TikTokAccount.paystackSubscriptionCode has a UNIQUE index; dropping the
-- column drops the index implicitly, but we name it for clarity.
DROP INDEX IF EXISTS "TikTokAccount_paystackSubscriptionCode_key";

ALTER TABLE "TikTokAccount" DROP COLUMN IF EXISTS "paystackSubscriptionCode";
ALTER TABLE "TikTokAccount" DROP COLUMN IF EXISTS "paystackEmailToken";

ALTER TABLE "User" DROP COLUMN IF EXISTS "paystackCustomerCode";

COMMIT;
