import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, rateLimit } from "@/lib/rate-limit";
import { readUrlEncodedBody } from "@/lib/request-body";
import { newsletterSchema } from "@/lib/validations";

function sentRedirect() {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return NextResponse.redirect(new URL("/forgot-password?sent=1", baseUrl), 303);
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "password-reset-request", 5, 60 * 60_000);
  if (limited) return limited;

  const body = await readUrlEncodedBody(request, 2_048);
  if (!body.ok) return sentRedirect();
  const parsed = newsletterSchema.safeParse(body.value);
  if (!parsed.success) return sentRedirect();

  try {
    if (Math.random() < 0.05) {
      await prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    }
    const emailLimit = await rateLimit(`password-reset-email:${parsed.data.email}`, 3, 60 * 60_000);
    if (!emailLimit.ok) return sentRedirect();
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true, passwordHash: true } });
    if (!user?.passwordHash) return sentRedirect();

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60_000);
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      prisma.passwordResetToken.create({ data: { tokenHash, userId: user.id, expiresAt } })
    ]);

    const appUrl = process.env.NEXTAUTH_URL;
    if (!appUrl) throw new Error("NEXTAUTH_URL is not configured.");
    const resetUrl = new URL("/reset-password", appUrl);
    if (process.env.NODE_ENV === "production" && resetUrl.protocol !== "https:") {
      throw new Error("Password reset links require HTTPS in production.");
    }
    resetUrl.hash = `token=${token}`;
    try {
      await sendPasswordResetEmail(parsed.data.email, resetUrl.toString());
    } catch (error) {
      await prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
      console.error("Password reset email could not be sent.", error instanceof Error ? error.name : "unknown error");
    }
  } catch (error) {
    console.error("Password reset request failed.", error instanceof Error ? error.name : "unknown error");
  }
  return sentRedirect();
}
