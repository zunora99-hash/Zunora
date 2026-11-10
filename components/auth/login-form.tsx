"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authSchema } from "@/lib/validations";
import { toast } from "@/components/ui/toast";

type FormValues = z.infer<typeof authSchema>;

function getSafeCallbackPath(callbackUrl: string | null) {
  if (!callbackUrl) return null;
  try {
    const destination = new URL(callbackUrl, window.location.origin);
    if (destination.origin !== window.location.origin) return null;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return null;
  }
}

export function LoginForm({ googleConfigured }: { googleConfigured: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const form = useForm<FormValues>({ resolver: zodResolver(authSchema), defaultValues: { email: "", password: "" } });

  async function signInWithGoogle() {
    if (!googleConfigured) {
      toast({
        title: "Google sign-in unavailable",
        description: "Google sign-in hasn’t been enabled for this store yet. Please use email and password for now."
      });
      return;
    }

    try {
      await signIn("google", {
        callbackUrl: getSafeCallbackPath(params.get("callbackUrl")) ?? "/account"
      });
    } catch (error) {
      console.error("Google sign-in request failed.", error);
      toast({
        title: "Google sign-in unavailable",
        description: "Check that Google OAuth is configured for this deployment, then try again."
      });
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      const response = await signIn("credentials", { ...values, redirect: false });
      if (response?.error) {
        toast({
          title: "Login failed",
          description: response.error === "Configuration"
            ? "The authentication server is not configured. Set NEXTAUTH_SECRET, NEXTAUTH_URL, and DATABASE_URL, then restart the app."
            : "Check your email and password."
        });
        return;
      }
      const session = await getSession();
      const callbackPath = getSafeCallbackPath(params.get("callbackUrl"));
      const defaultPath = session?.user.role === "ADMIN" ? "/admin" : "/account";
      router.push(callbackPath && (session?.user.role === "ADMIN" || !callbackPath.startsWith("/admin"))
        ? callbackPath
        : defaultPath);
      router.refresh();
    } catch (error) {
      console.error("Login request failed.", error);
      toast({
        title: "Login failed",
        description: "Could not reach the authentication server. Check your connection and server configuration."
      });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <Button type="button" variant="outline" onClick={signInWithGoogle}>
        <GoogleMark />
        Continue with Google
      </Button>
      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>Or use email</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <Input type="email" placeholder="Email" {...form.register("email")} />
      <Input type="password" placeholder="Password" {...form.register("password")} />
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Signing in..." : "Login"}</Button>
      <div className="flex justify-between text-sm">
        <Link href="/forgot-password" className="text-primary underline">Forgot password?</Link>
        <Link href="/signup" className="text-primary underline">Create account</Link>
      </div>
    </form>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-4 w-4">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.64 5.93c4.46-4.12 7.13-10.2 7.13-17.58Z" />
      <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.95 23.95 0 0 0 0 21.56l7.98-6.19Z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.65-5.93c-2.13 1.43-4.85 2.28-8.25 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
    </svg>
  );
}
