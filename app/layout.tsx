import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { AuthProvider } from "@/components/layout/auth-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { Toaster } from "@/components/ui/toast";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`
  },
  description: "Discover Zunora premium dry fruits and snacks, including Masala Cashews, almonds, pistachios, dates, and curated gift boxes.",
  applicationName: siteConfig.name
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          <Header />
          <main className="min-h-screen pb-16 md:pb-0">{children}</main>
          <Footer />
          <CartDrawer />
          <MobileNav />
          <CookieConsent />
          <Toaster />
        </AuthProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
      </body>
    </html>
  );
}
