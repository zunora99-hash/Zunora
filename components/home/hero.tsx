"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Gift, MapPin, PackageCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const trustItems = [
  { label: "25 g packs · ₹40 each", icon: PackageCheck },
  { label: "30 g jars · ₹65 each", icon: Sparkles },
  { label: "Free 15 g mix with any 3 jars", icon: Gift }
];

export function Hero() {
  const reduced = useReducedMotion();
  return (
    <section className="relative isolate overflow-hidden bg-[#f8f3e9]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_46%,rgba(214,183,126,0.32),transparent_38%),linear-gradient(135deg,#fbf8f1_0%,#f4ead9_58%,#e9d7bc_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
      <div className="container relative z-10 grid min-h-[min(780px,calc(100svh-5rem))] items-center gap-8 py-12 md:grid-cols-[0.94fr_1.06fr] md:gap-4 md:py-16">
        <motion.div initial={reduced ? false : { opacity: 0, y: 20 }} animate={reduced ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-20 rounded-[2rem] border border-white/75 bg-white/55 p-6 shadow-[0_30px_90px_-45px_rgba(77,50,26,0.42)] backdrop-blur-xl md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-olive/15 bg-white/70 px-3 py-1.5 text-xs font-semibold tracking-wide text-olive shadow-sm">
            <MapPin className="h-3.5 w-3.5" /> Belagavi, Karnataka
          </div>
          <p className="eyebrow mt-6">Meet {siteConfig.name} · Cashew jars and snack packs</p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl font-bold leading-[1.04] tracking-tight text-cacao md:text-6xl xl:text-7xl">
            Dry fruits in Belagavi, made memorable.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            Discover Zunora cashews in 30 g jars and 25 g snack packs. Jars are ₹65 each, and an order of any three jars includes one free 15 g Pista & Cashew Mix.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/shop">Shop cashew packs <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dry-fruits-belgaum">Explore local delivery</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 border-t border-cacao/10 pt-6 text-sm sm:grid-cols-3">
            {trustItems.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-start gap-2 font-semibold leading-5 text-cacao">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-olive" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.96 }}
          animate={reduced ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="spatial-stage relative mx-auto w-full max-w-2xl"
        >
          <div className="relative aspect-[1.2] overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/35 shadow-[0_45px_110px_-45px_rgba(77,50,26,0.48)] backdrop-blur-xl md:aspect-[1.18]">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_58%,rgba(255,255,255,0.9),transparent_55%),linear-gradient(145deg,rgba(255,255,255,0.72),rgba(214,183,126,0.24))]" />
            <div aria-hidden="true" className="absolute inset-x-[12%] bottom-[8%] h-[16%] rounded-[50%] bg-[#9b7448]/20 blur-2xl" />
            <div className="product-layer product-layer-left absolute left-[2%] top-[13%] h-[79%] w-[36%] [transform:perspective(900px)_rotateY(10deg)_rotateZ(-5deg)]">
              <Image src="/products/hero-raw-cashew.png" alt="Zunora Raw & Natural Cashew 25 g pack" fill priority sizes="(min-width: 768px) 18vw, 36vw" className="object-contain drop-shadow-[0_25px_18px_rgba(61,38,24,0.2)]" />
            </div>
            <div className="product-layer product-layer-center absolute left-[29%] top-[3%] z-10 h-[94%] w-[42%] [transform:perspective(900px)_translateZ(50px)]">
              <Image src="/products/hero-salted-cashew.png" alt="Zunora Salted Cashew 25 g pack" fill priority sizes="(min-width: 768px) 22vw, 42vw" className="object-contain drop-shadow-[0_35px_22px_rgba(61,38,24,0.28)]" />
            </div>
            <div className="product-layer product-layer-right absolute right-[2%] top-[13%] h-[79%] w-[36%] [transform:perspective(900px)_rotateY(-10deg)_rotateZ(5deg)]">
              <Image src="/products/hero-pista-cashew.png" alt="Zunora Pista & Cashew Mix 15 g pack" fill priority sizes="(min-width: 768px) 18vw, 36vw" className="object-contain drop-shadow-[0_25px_18px_rgba(61,38,24,0.2)]" />
            </div>
          </div>
          <div className="absolute -bottom-4 left-2 z-20 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-[0_18px_45px_-22px_rgba(61,38,24,0.35)] backdrop-blur-xl sm:-left-5 sm:bottom-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-olive">Small batch · Big flavour</p>
            <p className="mt-1 font-serif text-lg font-bold text-cacao">A better little break.</p>
          </div>
          <div className="absolute -right-1 top-5 z-20 flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-2 text-xs font-semibold text-cacao shadow-lg backdrop-blur-xl sm:right-2 sm:top-10">
            <Sparkles className="h-3.5 w-3.5 text-[#b87820]" /> 3 delicious cashew flavours
          </div>
        </motion.div>
      </div>
    </section>
  );
}
