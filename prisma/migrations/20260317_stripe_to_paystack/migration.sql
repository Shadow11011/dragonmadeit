-- Rename Stripe fields to Paystack equivalents (preserve existing data)
ALTER TABLE "User" RENAME COLUMN "stripeCustomerId" TO "paystackCustomerCode";

ALTER TABLE "TikTokAccount" RENAME COLUMN "stripeSubscriptionId" TO "paystackSubscriptionCode";

-- Add email token field required by Paystack for subscription cancellation
ALTER TABLE "TikTokAccount" ADD COLUMN "paystackEmailToken" TEXT;
