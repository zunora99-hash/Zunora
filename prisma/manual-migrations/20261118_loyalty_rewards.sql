CREATE TABLE IF NOT EXISTS "LoyaltyCustomer" (
  "id" TEXT NOT NULL,
  "qrCodeId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "phoneNormalized" TEXT NOT NULL,
  "rewardRedeemedAt" TIMESTAMP(3),
  "rewardOrderNumber" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LoyaltyCustomer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LoyaltyCustomer_phoneNormalized_key"
  ON "LoyaltyCustomer"("phoneNormalized");
CREATE UNIQUE INDEX IF NOT EXISTS "LoyaltyCustomer_rewardOrderNumber_key"
  ON "LoyaltyCustomer"("rewardOrderNumber");
CREATE INDEX IF NOT EXISTS "LoyaltyCustomer_qrCodeId_createdAt_idx"
  ON "LoyaltyCustomer"("qrCodeId", "createdAt");
CREATE INDEX IF NOT EXISTS "LoyaltyCustomer_rewardRedeemedAt_idx"
  ON "LoyaltyCustomer"("rewardRedeemedAt");
