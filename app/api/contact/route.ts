import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readUrlEncodedBody } from "@/lib/request-body";
import { contactSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "contact", 6, 60 * 60_000);
  if (limited) return limited;

  const body = await readUrlEncodedBody(request, 12_000);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: body.status });
  const parsed = contactSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    await prisma.contactMessage.create({ data: parsed.data });
  } catch (error) {
    console.error("Contact message could not be stored.", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Your message could not be sent. Please try again later." }, { status: 503 });
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  return NextResponse.redirect(new URL("/contact?sent=1", siteUrl), 303);
}
