"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const trustItems = [
  { label: "FSSAI certified", icon: ShieldCheck },
  { label: "Fresh batch packing", icon: Sparkles },
  { label: "Free shipping above Rs. 999", icon: Truck }
];

export function Hero() {
  const reduced = useReducedMotion();
  return (
    <section className="relative overflow-hidden bg-[#f8efe0]">
      <div className="container grid min-h-[calc(100svh-5rem)] items-center gap-10 py-12 md:grid-cols-[1fr_0.9fr] md:py-16">
        <motion.div initial={reduced ? false : { opacity: 0, y: 20 }} animate={reduced ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="eyebrow">Meet {siteConfig.name} · {siteConfig.tagline}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl font-bold leading-[1.05] text-cacao md:text-7xl">
            A little crunch. A lot of Zunora.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Meet our Masala Cashews: a bold, savory snack made for sharing, savoring, and taking along wherever the day goes.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/shop">
                Shop best sellers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/shop?category=gift-boxes">Explore gift boxes</Link>
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
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#fffdf8] p-3 shadow-soft md:p-5">
            <Image
              src="/zunora-masala-cashew.png"
              alt="Zunora Masala Cashew premium dry fruits pack"
              fill
              priority
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-contain"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
