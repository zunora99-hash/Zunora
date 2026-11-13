import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

// Vercel's deployment URL can be a unique preview hostname. Use the stable
// production project domain for OAuth callbacks on production deployments.
const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
if (process.env.VERCEL_ENV === "production" && vercelProductionHost) {
  process.env.NEXTAUTH_URL = new URL(`https://${vercelProductionHost}`).origin;
}

const providers = [
  CredentialsProvider({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials, request) {
      const parsed = authSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const ip = request.headers?.["x-real-ip"] ||
        (process.env.VERCEL ? request.headers?.["x-forwarded-for"]?.split(",", 1)[0]?.trim() : undefined) ||
        "unknown";
      try {
        const limit = await rateLimit(`login:${ip}`, 10, 15 * 60_000);
        if (!limit.ok) return null;
      } catch (error) {
        console.error("Login rate limiter unavailable; login rejected.", error instanceof Error ? error.name : "unknown error");
        return null;
      }

      const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
      if (!user?.passwordHash) {
        // Equalize the expensive password check to reduce account-enumeration timing leaks.
        await bcrypt.hash(parsed.data.password, 12);
        return null;
      }

      const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as "USER" | "ADMIN"
      };
    }
  })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }) as never
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
  pages: {
    signIn: "/login"
  },
  providers,
  callbacks: {
    async jwt({ token, user: signedInUser }) {
      if (!token.sub) return token;
      const user = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { role: true, authVersion: true }
      });
      const claims = token as typeof token & { authVersion?: number };
      if (!user || (!signedInUser && typeof claims.authVersion !== "number") ||
        (typeof claims.authVersion === "number" && claims.authVersion !== user.authVersion)) {
        delete token.sub;
        delete token.role;
        delete claims.authVersion;
        return token;
      }
      claims.authVersion = user.authVersion;
      token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
        if (!token.sub) {
          session.user.name = null;
          session.user.email = null;
          session.user.image = null;
        }
      }
      return session;
    }
  }
};
