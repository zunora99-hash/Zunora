import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhoneNumber } from "@/lib/loyalty";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/request-body";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "loyalty-check", 20, 15 * 60_000);
  if (limited) return limited;
  const body = await readJsonBody(request, 2_048);
  if (!body.ok || !body.value || typeof body.value !== "object" || !("code" in body.value) || typeof body.value.code !== "string") {
    return NextResponse.json({ error: "Enter a coupon code." }, { status: 400 });
  }

  const code = body.value.code.trim().toUpperCase();
  if (code === "FRESH10") return NextResponse.json({ eligible: true, discountPercent: 10 });
  if (!/^ZUN5-[A-F0-9]{16}$/.test(code)) return NextResponse.json({ eligible: false, discountPercent: 0 });
  const phone = "phone" in body.value && typeof body.value.phone === "string"
    ? normalizePhoneNumber(body.value.phone)
    : null;
  if (!phone) return NextResponse.json({ eligible: false, discountPercent: 0 });
  const matches = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT "id" FROM "LoyaltyCustomer"
    WHERE "rewardCode" = ${code} AND "phoneNormalized" = ${phone} AND "rewardRedeemedAt" IS NULL
    LIMIT 1
  `;
  return NextResponse.json({ eligible: matches.length > 0, discountPercent: matches.length > 0 ? 5 : 0 });
}
