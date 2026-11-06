import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validations";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Account creation is not configured. Set DATABASE_URL in your local .env file and restart the app." }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limited = rateLimit(`signup:${ip}`, 5);
  if (!limited.ok) return NextResponse.json({ error: "Too many signup attempts" }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) return NextResponse.json({ error: "An account already exists for this email" }, { status: 409 });

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
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
    }

    console.error("Signup failed while accessing the account database.", error);
    return NextResponse.json({
      error: "Unable to reach the account database. Check DATABASE_URL, make sure PostgreSQL is running, and confirm the database exists."
    }, { status: 503 });
  }
}
