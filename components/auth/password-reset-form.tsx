"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordResetForm() {
  const [token, setToken] = useState("");

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const resetToken = fragment.get("token") ?? "";
    if (/^[a-f\d]{64}$/i.test(resetToken)) setToken(resetToken);
    // Keep the bearer token out of the address bar and analytics after reading it.
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  return (
    <form className="grid gap-4" action="/api/reset-password" method="post">
      <input type="hidden" name="token" value={token} />
      <Input type="password" name="password" autoComplete="new-password" minLength={12} maxLength={72} placeholder="New password (12 characters minimum)" required />
      <Input type="password" name="confirmPassword" autoComplete="new-password" minLength={12} maxLength={72} placeholder="Confirm new password" required />
      <Button type="submit" disabled={!token}>Update password</Button>
      {!token ? <p className="text-sm text-muted-foreground">Open the reset link from your email to set a new password.</p> : null}
    </form>
  );
}
