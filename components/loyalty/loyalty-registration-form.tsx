"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScratchCard } from "@/components/loyalty/scratch-card";

type RegistrationResponse = { customerId?: string; rewardCode?: string; alreadyRegistered?: boolean; alreadyUsed?: boolean; error?: string | { fieldErrors?: Record<string, string[]> } };
type Registration = { customerId: string; rewardCode: string };

export function LoyaltyRegistrationForm({ qrCodeId }: { qrCodeId: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [registration, setRegistration] = useState<Registration | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/loyalty/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, qrCodeId })
      });
      const result = await response.json() as RegistrationResponse;
      if (!response.ok) {
        const validationMessage = typeof result.error === "object"
          ? Object.values(result.error.fieldErrors ?? {}).flat()[0]
          : result.error;
        setMessage(typeof validationMessage === "string" ? validationMessage : "Please check your details and try again.");
        return;
      }
      if (result.customerId && result.rewardCode) {
        setRegistration({ customerId: result.customerId, rewardCode: result.rewardCode });
        setMessage(result.alreadyRegistered ? "Your existing reward is ready. Scratch to reveal the code again." : "Registration complete. Scratch to reveal your unique 5% code.");
      } else {
        setMessage(result.alreadyUsed ? "This mobile number has already used its one-time 5% reward." : "We could not issue a reward code. Please contact support.");
      }
    } catch {
      setMessage("We could not save your registration. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      {registration ? (
        <>
          {message ? <p role="status" className="text-sm text-muted-foreground">{message}</p> : null}
          <ScratchCard rewardCode={registration.rewardCode} customerId={registration.customerId} />
        </>
      ) : (
        <>
          <label className="grid gap-2 text-sm font-medium" htmlFor="reward-name">
            Name
            <Input id="reward-name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-medium" htmlFor="reward-phone">
            Mobile number used for your previous order
            <Input id="reward-phone" type="tel" inputMode="tel" autoComplete="tel" required minLength={8} maxLength={30} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="10 digit mobile number" />
          </label>
          <p className="text-xs text-muted-foreground">We store your mobile number to prevent duplicate registrations and link your one-time code to your reward record.</p>
          <Button disabled={busy}>{busy ? "Saving..." : "Register for 5% off next order"}</Button>
        </>
      )}
      {message ? <p role="status" className="text-sm text-muted-foreground">{message}</p> : null}
    </form>
  );
}
