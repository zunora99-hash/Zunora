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

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const form = useForm<FormValues>({ resolver: zodResolver(authSchema), defaultValues: { email: "", password: "" } });

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
      router.push(params.get("callbackUrl") ?? (session?.user.role === "ADMIN" ? "/admin" : "/account"));
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
