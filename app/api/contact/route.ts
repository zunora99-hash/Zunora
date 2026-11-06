import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limited = rateLimit(`contact:${ip}`, 6);
  if (!limited.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const data = Object.fromEntries(await request.formData());
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await prisma.contactMessage.create({ data: parsed.data });
  return NextResponse.redirect(new URL("/contact?sent=1", request.url), 303);
}
