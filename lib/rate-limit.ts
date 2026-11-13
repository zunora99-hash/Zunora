import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RateLimitRow = { count: number; resetAt: Date };

/** Atomic PostgreSQL-backed limit shared by serverless instances. The raw key is never stored. */
export async function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(windowMs) || windowMs < 1) {
    throw new Error("Invalid rate limit configuration.");
  }

  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const hmacSecret = process.env.NEXTAUTH_SECRET || "development-only-rate-limit-key";
  if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is required for rate-limit key protection.");
  }
  const bucketKey = createHmac("sha256", hmacSecret).update(key).digest("hex");
  const [bucket] = await prisma.$queryRaw<RateLimitRow[]>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
    VALUES (${bucketKey}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."resetAt" <= ${now} THEN 1
        ELSE LEAST("RateLimitBucket"."count" + 1, ${limit + 1})
      END,
      "resetAt" = CASE
        WHEN "RateLimitBucket"."resetAt" <= ${now} THEN ${resetAt}
        ELSE "RateLimitBucket"."resetAt"
      END
    RETURNING "count", "resetAt"
  `;

  // Opportunistically remove old hashed buckets without running a table scan on every request.
  if (Math.random() < 0.01) {
    try {
      await prisma.$executeRaw`DELETE FROM "RateLimitBucket" WHERE "resetAt" < ${new Date(now.getTime() - 86_400_000)}`;
    } catch (error) {
      console.error("Rate-limit bucket cleanup failed.", error instanceof Error ? error.name : "unknown error");
    }
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt.getTime() - now.getTime()) / 1000));
  return {
    ok: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds
  };
}

export function getClientIp(request: Request) {
  // Nginx must overwrite X-Real-IP with the connecting client's address.
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && realIp.length <= 64) return realIp;

  // Vercel supplies this header at its trusted edge. Do not expose a self-hosted
  // app directly to the internet; its Nginx proxy should set X-Real-IP.
  if (process.env.VERCEL) {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
    if (forwarded && forwarded.length <= 64) return forwarded;
  }
  return "unknown";
}

export async function enforceRateLimit(request: Request, scope: string, limit: number, windowMs: number) {
  try {
    const result = await rateLimit(`${scope}:${getClientIp(request)}`, limit, windowMs);
    if (result.ok) return null;
    return NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds), "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Rate limiter unavailable; request rejected.", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Service temporarily unavailable. Please try again." }, { status: 503 });
  }
}
