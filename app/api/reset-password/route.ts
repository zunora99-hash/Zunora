import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readUrlEncodedBody } from "@/lib/request-body";
import { passwordResetSchema } from "@/lib/validations";

function resetRedirect(status: "success" | "invalid") {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return NextResponse.redirect(new URL(`/reset-password?reset=${status}`, baseUrl), 303);
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "password-reset-complete", 10, 15 * 60_000);
  if (limited) return limited;
  const body = await readUrlEncodedBody(request, 4_096);
  if (!body.ok) return resetRedirect("invalid");
  const parsed = passwordResetSchema.safeParse(body.value);
  if (!parsed.success) return resetRedirect("invalid");

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const token = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!token || token.expiresAt <= new Date()) return resetRedirect("invalid");

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const now = new Date();
  const changed = await prisma.$transaction(async (tx) => {
    const consumed = await tx.passwordResetToken.deleteMany({ where: { id: token.id, expiresAt: { gt: now } } });
    if (consumed.count !== 1) return false;
    await tx.user.update({ where: { id: token.userId }, data: { passwordHash, authVersion: { increment: 1 } } });
    await tx.passwordResetToken.deleteMany({ where: { userId: token.userId } });
    return true;
  });
  return resetRedirect(changed ? "success" : "invalid");
}
