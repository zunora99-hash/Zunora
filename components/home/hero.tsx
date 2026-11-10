"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Gift, PackageCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const trustItems = [
  { label: "25 g packs · ₹40 each", icon: PackageCheck },
  { label: "Three cashew flavours", icon: Sparkles },
  { label: "Free 15 g mix with each pack", icon: Gift }
];

export function Hero() {
  const reduced = useReducedMotion();
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#fbf5e9] via-[#f8efe0] to-[#ead9bd]">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#d6b77e]/35 blur-3xl" />
      <div className="container relative z-10 grid min-h-[calc(100svh-5rem)] items-center gap-10 py-12 md:grid-cols-[1fr_0.9fr] md:py-16">
        <motion.div initial={reduced ? false : { opacity: 0, y: 20 }} animate={reduced ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="rounded-3xl border border-white/55 bg-white/35 p-6 shadow-[0_24px_70px_-38px_rgba(77,50,26,0.42)] backdrop-blur-xl md:p-9">
          <p className="eyebrow">Meet {siteConfig.name} · 25 g cashew snack packs</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl font-bold leading-[1.05] text-cacao md:text-7xl">
            Small packs. Big flavour.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Shop Zunora Salted, Peri Peri Masala, and Raw & Natural Cashew packs. Get a free 15 g Pista & Cashew Mix with each eligible pack during this limited-time offer.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/shop">
                Shop cashew packs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/shop?category=almonds">Almonds coming soon</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
            {trustItems.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 font-semibold text-cacao">
                <Icon className="h-4 w-4 text-olive" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.96 }}
          animate={reduced ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative mx-auto w-full max-w-2xl"
        >
          <div className="relative aspect-[1.42] overflow-hidden rounded-[2rem] border border-white/70 bg-white/30 shadow-[0_30px_90px_-35px_rgba(77,50,26,0.55)] backdrop-blur-2xl">
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-white/65 via-white/10 to-[#d6b77e]/25" />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#c6904f]/20 to-transparent" />
            <div className="absolute left-[2%] top-[13%] h-[79%] w-[36%]">
              <Image
                src="/products/zunora-raw-cashew-25g.png"
                alt="Zunora Raw & Natural Cashew 25 g pack"
                fill
                priority
                sizes="(min-width: 768px) 18vw, 36vw"
                className="object-contain drop-shadow-xl"
              />
            </div>
            <div className="absolute left-[29%] top-[3%] z-10 h-[94%] w-[42%]">
              <Image
                src="/products/zunora-salted-cashew-25g.png"
                alt="Zunora Salted Cashew 25 g pack"
                fill
                priority
                sizes="(min-width: 768px) 22vw, 42vw"
                className="object-contain drop-shadow-2xl"
              />
            </div>
            <div className="absolute right-[2%] top-[13%] h-[79%] w-[36%]">
              <Image
                src="/products/zunora-pista-cashew-mix-15g.png"
                alt="Zunora Pista & Cashew Mix 15 g pack"
                fill
                priority
                sizes="(min-width: 768px) 18vw, 36vw"
                className="object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
