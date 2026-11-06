import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const newsletterSchema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const data = Object.fromEntries(await request.formData());
  const parsed = newsletterSchema.safeParse(data);
  if (!parsed.success) return NextResponse.redirect(new URL("/?newsletter=invalid", request.url), 303);

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email }
  });
  return NextResponse.redirect(new URL("/?newsletter=ok", request.url), 303);
}
