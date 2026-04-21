-- CreateTable
CREATE TABLE "DeviceFingerprint" (
    "id" TEXT NOT NULL,
    "clientHash" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "uaHash" TEXT NOT NULL,
    "tier" "Tier" NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceFingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeviceFingerprint_clientHash_idx" ON "DeviceFingerprint"("clientHash");

-- CreateIndex
CREATE INDEX "DeviceFingerprint_ipHash_idx" ON "DeviceFingerprint"("ipHash");

-- CreateIndex
CREATE INDEX "DeviceFingerprint_userId_idx" ON "DeviceFingerprint"("userId");
