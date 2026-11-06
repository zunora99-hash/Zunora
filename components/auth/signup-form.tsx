"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupSchema } from "@/lib/validations";
import { toast } from "@/components/ui/toast";

type FormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(signupSchema), defaultValues: { name: "", email: "", password: "" } });

  async function onSubmit(values: FormValues) {
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const result = await response.json() as { error?: unknown };
      if (!response.ok) {
        const description = typeof result.error === "string"
          ? result.error
          : "Please check your name, email, and password (at least 8 characters).";
        toast({ title: "Signup failed", description });
        return;
      }
      toast({ title: "Account created", description: "You can now log in." });
      router.push("/login");
    } catch (error) {
      console.error("Signup request failed.", error);
      toast({ title: "Signup failed", description: "Could not reach the server. Check your connection and try again." });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <Input placeholder="Full name" {...form.register("name")} />
      <Input type="email" placeholder="Email" {...form.register("email")} />
      <Input type="password" placeholder="Password" {...form.register("password")} />
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating..." : "Create account"}</Button>
    </form>
  );
}
