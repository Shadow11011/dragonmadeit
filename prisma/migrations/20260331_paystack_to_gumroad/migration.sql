-- Rename User.paystackCustomerCode to gumroadCustomerId
ALTER TABLE "User" RENAME COLUMN "paystackCustomerCode" TO "gumroadCustomerId";

-- Drop unique index on old column and create regular index
DROP INDEX IF EXISTS "User_paystackCustomerCode_key";

-- Rename TikTokAccount.paystackSubscriptionCode to gumroadSubscriptionId
ALTER TABLE "TikTokAccount" RENAME COLUMN "paystackSubscriptionCode" TO "gumroadSubscriptionId";

-- Drop old unique index and create new one
DROP INDEX IF EXISTS "TikTokAccount_paystackSubscriptionCode_key";
CREATE UNIQUE INDEX "TikTokAccount_gumroadSubscriptionId_key" ON "TikTokAccount"("gumroadSubscriptionId");

-- Drop paystackEmailToken (not needed for Gumroad)
ALTER TABLE "TikTokAccount" DROP COLUMN IF EXISTS "paystackEmailToken";
