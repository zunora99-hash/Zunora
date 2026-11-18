ALTER TABLE "LoyaltyCustomer"
  ADD COLUMN IF NOT EXISTS "rewardCode" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "LoyaltyCustomer_rewardCode_key"
  ON "LoyaltyCustomer"("rewardCode");
