import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validations";

function getDatabaseError(error: unknown) {
  if (!error || typeof error !== "object") return { code: undefined, message: undefined };
  const code = "code" in error && typeof error.code === "string" ? error.code : undefined;
  const message = "message" in error && typeof error.message === "string" ? error.message : undefined;
  return { code, message };
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Account creation is not configured. Set DATABASE_URL in the hosting environment and redeploy the app." }, { status: 503 });
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
    const { code, message } = getDatabaseError(error);
    if (code === "P2002") {
      return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
    }

    const safeMessage = message?.replace(/postgres(?:ql)?:\/\/[^\s"'`]+/gi, "[redacted database URL]");
    console.error("Signup failed while accessing the account database.", { code, message: safeMessage });
    const databaseErrors: Record<string, string> = {
      P1000: "The Render database rejected the credentials. Check the username and password in Vercel's DATABASE_URL.",
      P1001: "The app cannot reach the Render database. Check that the database is running and DATABASE_URL uses its External Database URL.",
      P1002: "The Render database connection timed out. Check that the database is running and reachable.",
      P1003: "The database named in DATABASE_URL does not exist on Render.",
      P1010: "The Render database user does not have permission to access this database.",
      P1011: "A secure connection to Render failed. Add sslmode=require to the DATABASE_URL query string.",
      P1013: "DATABASE_URL is invalid. Copy the full External Database URL from Render.",
      P2021: "The required database table is missing. Push this project's Prisma schema to the Render database.",
      P2022: "The database schema is out of date. Push this project's Prisma schema to the Render database."
    };
    return NextResponse.json({
      error: (code && databaseErrors[code]) || "The account database request failed. Check the Vercel function logs for the Prisma error code."
    }, { status: 503 });
  }
}
