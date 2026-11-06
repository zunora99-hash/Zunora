"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const consentCookie = "zunora_analytics_consent";
const consentMaxAge = 60 * 60 * 24 * 180;
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type Consent = "accepted" | "rejected" | null;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

function readConsent(): Consent {
  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${consentCookie}=`))
    ?.split("=")[1];
  return value === "accepted" || value === "rejected" ? value : null;
}

function saveConsent(consent: Exclude<Consent, null>) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${consentCookie}=${consent}; Max-Age=${consentMaxAge}; Path=/; SameSite=Lax${secure}`;
}

export function CookieConsent() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (measurementId) setConsent(readConsent());
  }, []);

  useEffect(() => {
    if (!measurementId || consent !== "accepted") return;

    window.dataLayer = window.dataLayer ?? [];
    window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
    window.gtag("consent", "default", { analytics_storage: "denied" });
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { send_page_view: false });

    if (!document.querySelector('script[data-zunora-analytics="true"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      script.dataset.zunoraAnalytics = "true";
      document.head.appendChild(script);
    }
  }, [consent]);

  useEffect(() => {
    if (!measurementId || consent !== "accepted" || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_path: `${pathname}${window.location.search}`
    });
  }, [consent, pathname]);

  function chooseConsent(choice: Exclude<Consent, null>) {
    saveConsent(choice);
    setConsent(choice);
    setSettingsOpen(false);
    if (choice === "rejected") {
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
    }
  }

  if (!measurementId) return null;

  const showBanner = consent === null || settingsOpen;
  return (
    <>
      {showBanner ? (
        <section
          aria-label="Cookie preferences"
          aria-live="polite"
          className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-3xl rounded-lg border bg-background p-5 shadow-soft md:bottom-6"
        >
          <h2 className="font-semibold">Analytics cookies</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            With your permission, Google Analytics uses cookies to help us understand site usage and improve the store. You can reject analytics and still use the site. Read our <Link className="underline" href="/privacy">Privacy Policy</Link>.
          </p>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => chooseConsent("rejected")}>Reject analytics</Button>
            <Button type="button" onClick={() => chooseConsent("accepted")}>Accept analytics</Button>
          </div>
        </section>
      ) : (
        <button
          type="button"
          className="fixed bottom-20 left-4 z-40 rounded-full border bg-background px-3 py-2 text-xs shadow-soft md:bottom-6"
          onClick={() => setSettingsOpen(true)}
        >
          Cookie settings
        </button>
      )}
    </>
  );
}
