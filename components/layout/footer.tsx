import Link from "next/link";
import { Facebook, Instagram, MessageCircle, Send } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const whatsappMessage = "Hi Zunora! I'd like to buy your dry fruits. Please share the available products and prices.\n";

export function Footer() {
  return (
    <footer className="border-t bg-cacao text-white">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div>
          <p className="font-serif text-2xl font-bold">{siteConfig.name}</p>
          <p className="mt-3 max-w-sm text-sm text-white/75">{siteConfig.tagline}. Batch-packed dry fruits, transparent sourcing, and festive-ready freshness.</p>
          <div className="mt-5 flex gap-3">
            <Link href={siteConfig.social.instagram} aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href={siteConfig.social.facebook} aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <div>
          <p className="font-semibold">Shop</p>
          <div className="mt-3 grid gap-2 text-sm text-white/75">
            <Link href="/shop?category=almonds">Premium almonds</Link>
            <Link href="/shop?category=cashews">Cashews</Link>
            <Link href="/shop?category=gift-boxes">Dry fruits gift boxes</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold">Policies</p>
          <div className="mt-3 grid gap-2 text-sm text-white/75">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/shipping-returns">Shipping & Returns</Link>
          </div>
        </div>
        <form action="/api/newsletter" method="post">
          <p className="font-semibold">Freshness notes</p>
          <p className="mt-3 text-sm text-white/75">Monthly offers, harvest updates, and gifting ideas.</p>
          <div className="mt-4 flex gap-2">
            <Input name="email" type="email" required placeholder="you@example.com" className="bg-white text-cacao" />
            <Button type="submit" variant="secondary" size="icon" aria-label="Subscribe">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        GST {siteConfig.gstNo} · FSSAI {siteConfig.fssaiNo} · © {new Date().getFullYear()} {siteConfig.name}
      </div>
      <Link
        href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-olive text-white shadow-soft md:bottom-6"
        aria-label="Order on WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
      </Link>
    </footer>
  );
}
