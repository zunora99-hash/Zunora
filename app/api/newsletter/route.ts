import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readUrlEncodedBody } from "@/lib/request-body";
import { newsletterSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "newsletter", 5, 60 * 60_000);
  if (limited) return limited;
  const body = await readUrlEncodedBody(request, 2_048);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: body.status });
  const parsed = newsletterSchema.safeParse(body.value);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  if (!parsed.success) return NextResponse.redirect(new URL("/?newsletter=invalid", siteUrl), 303);

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: {},
      create: { email: parsed.data.email }
    });
  } catch (error) {
    console.error("Newsletter subscription could not be stored.", error instanceof Error ? error.name : "unknown error");
    return NextResponse.redirect(new URL("/?newsletter=unavailable", siteUrl), 303);
  }
  return NextResponse.redirect(new URL("/?newsletter=ok", siteUrl), 303);
}
