-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL');

-- AlterTable
ALTER TABLE "TikTokAccount" ADD COLUMN "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY';
