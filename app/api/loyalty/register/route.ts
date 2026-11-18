import { randomBytes, randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { loyaltyQrCodeId, normalizePhoneNumber } from "@/lib/loyalty";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/request-body";
import { loyaltyRegistrationSchema } from "@/lib/validations";

function createRewardCode() {
  return `ZUN5-${randomBytes(8).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "loyalty-register", 5, 60 * 60_000);
  if (limited) return limited;
  const body = await readJsonBody(request, 4_096);
  if (!body.ok) return NextResponse.json({ error: "Registration details are missing or invalid." }, { status: body.status });
  const parsed = loyaltyRegistrationSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const phoneNormalized = normalizePhoneNumber(parsed.data.phone);
  if (!phoneNormalized) return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 });

  const existing = await prisma.$queryRaw<Array<{ id: string; rewardCode: string | null; rewardRedeemedAt: Date | null }>>`
    SELECT "id", "rewardCode", "rewardRedeemedAt" FROM "LoyaltyCustomer" WHERE "phoneNormalized" = ${phoneNormalized} LIMIT 1
  `;
  if (existing.length) {
    if (existing[0].rewardRedeemedAt) {
      return NextResponse.json({ customerId: existing[0].id, alreadyRegistered: true, alreadyUsed: true });
    }
    let rewardCode = existing[0].rewardCode;
    if (!rewardCode) {
      const newCode = createRewardCode();
      await prisma.$executeRaw`
        UPDATE "LoyaltyCustomer" SET "rewardCode" = ${newCode}
        WHERE "id" = ${existing[0].id} AND "rewardCode" IS NULL AND "rewardRedeemedAt" IS NULL
      `;
      const updated = await prisma.$queryRaw<Array<{ rewardCode: string | null }>>`
        SELECT "rewardCode" FROM "LoyaltyCustomer" WHERE "id" = ${existing[0].id} LIMIT 1
      `;
      rewardCode = updated[0]?.rewardCode ?? null;
    }
    if (rewardCode) return NextResponse.json({ customerId: existing[0].id, rewardCode, alreadyRegistered: true });
  }

  const customerId = `ZL-${randomUUID().replace(/-/g, "").toUpperCase()}`;
  const rewardCode = createRewardCode();
  try {
    await prisma.$executeRaw`
      INSERT INTO "LoyaltyCustomer" ("id", "qrCodeId", "name", "phone", "phoneNormalized", "rewardCode")
      VALUES (${customerId}, ${loyaltyQrCodeId}, ${parsed.data.name}, ${parsed.data.phone}, ${phoneNormalized}, ${rewardCode})
    `;
    return NextResponse.json({ customerId, rewardCode, alreadyRegistered: false }, { status: 201 });
  } catch (error) {
    try {
      const duplicate = await prisma.$queryRaw<Array<{ id: string; rewardCode: string | null; rewardRedeemedAt: Date | null }>>`
        SELECT "id", "rewardCode", "rewardRedeemedAt" FROM "LoyaltyCustomer" WHERE "phoneNormalized" = ${phoneNormalized} LIMIT 1
      `;
      if (duplicate.length && duplicate[0].rewardRedeemedAt) {
        return NextResponse.json({ customerId: duplicate[0].id, alreadyRegistered: true, alreadyUsed: true });
      }
      if (duplicate.length && duplicate[0].rewardCode) {
        return NextResponse.json({ customerId: duplicate[0].id, rewardCode: duplicate[0].rewardCode, alreadyRegistered: true });
      }
    } catch { /* Keep the original insertion failure for the server log. */ }
    console.error("Could not register loyalty customer", error);
    return NextResponse.json({ error: "We could not save your registration. Please try again." }, { status: 503 });
  }
}
