import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/request-body";
import { signupSchema } from "@/lib/validations";

function getDatabaseErrorCode(error: unknown) {
  return error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : undefined;
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Account creation is temporarily unavailable. Please try again later." }, { status: 503 });
  }

  const limited = await enforceRateLimit(request, "signup", 5, 15 * 60_000);
  if (limited) return limited;

  const body = await readJsonBody(request, 8_192);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: body.status });
  const parsed = signupSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) return NextResponse.json({ ok: true });

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const code = getDatabaseErrorCode(error);
    if (code === "P2002") {
      return NextResponse.json({ ok: true });
    }

    console.error("Signup failed while accessing the account database.", { code });
    return NextResponse.json({ error: "Account creation is temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
