-- RenameColumn: User.gumroadCustomerId -> paystackCustomerCode
ALTER TABLE "User" RENAME COLUMN "gumroadCustomerId" TO "paystackCustomerCode";

-- RenameColumn: TikTokAccount.gumroadSubscriptionId -> paystackSubscriptionCode
ALTER TABLE "TikTokAccount" RENAME COLUMN "gumroadSubscriptionId" TO "paystackSubscriptionCode";

-- AddColumn: TikTokAccount.paystackEmailToken (needed to cancel subscriptions via API)
ALTER TABLE "TikTokAccount" ADD COLUMN "paystackEmailToken" TEXT;
