-- Dodo Payments migration, phase 1: add the new columns alongside the
-- existing Paystack fields. The Paystack columns will be dropped in a
-- follow-up migration (`remove_paystack_fields`) once all write paths have
-- cut over to Dodo.
--
-- Changes:
--   User.dodoCustomerId             TEXT NULL
--   TikTokAccount.dodoSubscriptionId TEXT NULL UNIQUE
--
-- Wrapped in a transaction so the whole batch is all-or-nothing.

BEGIN;

ALTER TABLE "User" ADD COLUMN "dodoCustomerId" TEXT;

ALTER TABLE "TikTokAccount" ADD COLUMN "dodoSubscriptionId" TEXT;
CREATE UNIQUE INDEX "TikTokAccount_dodoSubscriptionId_key"
  ON "TikTokAccount"("dodoSubscriptionId");

COMMIT;
