import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, PackageCheck, ShieldCheck, Star, Truck } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categories, products } from "@/lib/catalog";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Premium Dry Fruits Online",
  description: "Discover Zunora premium dry fruits and snacks, including Masala Cashews, almonds, pistachios, dates, and curated gift boxes.",
  path: "/"
});

export default function HomePage() {
  const bestSellers = products.filter((product) => product.featured).slice(0, 8);
  const trustCards = [
    { title: "Purity checks", icon: ShieldCheck, copy: "Sourced from vetted suppliers with batch-level quality checks." },
    { title: "Freshness sealed", icon: PackageCheck, copy: "Packed in high-barrier pouches and dispatched quickly." },
    { title: "Fast delivery", icon: Truck, copy: "Reliable shipping across India with order tracking." },
    { title: "Natural nutrition", icon: Leaf, copy: "No artificial colors or preservatives in core dry fruits." }
  ];

  return (
    <>
      <Hero />
      <section className="section">
        <div className="container">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="eyebrow">Fresh categories</p>
              <h2 className="mt-2 font-serif text-4xl font-bold">Shop by craving</h2>
            </div>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/shop">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.slug} href={`/shop?category=${category.slug}`} className="group relative min-h-56 overflow-hidden rounded-lg border bg-card">
                <Image src={category.image} alt={`${category.name} category`} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-cacao/80 to-cacao/5" />
                <div className="absolute bottom-0 p-5 text-white">
                  <h3 className="font-serif text-2xl font-bold">{category.name}</h3>
                  <p className="mt-1 max-w-sm text-sm text-white/80">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-white/45">
        <div className="container">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="eyebrow">Best sellers</p>
              <h2 className="mt-2 font-serif text-4xl font-bold">Premium almonds, cashews, pistachios and more</h2>
            </div>
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link href="/shop">Shop all</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg bg-cacao p-8 text-white md:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-saffron">Festive offer</p>
            <h2 className="mt-3 font-serif text-4xl font-bold">Dry fruits gift boxes with corporate-ready packing.</h2>
            <p className="mt-4 max-w-2xl text-white/75">Use coupon FRESH10 on orders above Rs. 999. Every hamper is sealed, labelled, and built for freshness.</p>
            <Button className="mt-6" variant="secondary" asChild>
              <Link href="/shop?category=gift-boxes">Shop gift boxes</Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {trustCards.map(({ title, icon: Icon, copy }) => (
              <Card key={title}>
                <CardContent className="flex gap-4 p-5">
                  <Icon className="h-6 w-6 text-olive" />
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-white/45">
        <div className="container">
          <p className="eyebrow text-center">Zunora stories</p>
          <h2 className="mt-2 text-center font-serif text-4xl font-bold">See what customers think.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[
              { src: "/zunora-testimonial-1.mp4", label: "Zunora customer video testimonial 1" },
              { src: "/zunora-testimonial-2.mp4", label: "Zunora customer video testimonial 2" }
            ].map((video) => (
              <Card key={video.src}>
                <CardContent className="p-3">
                  <video
                    className="aspect-video w-full rounded-md bg-cacao object-contain"
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={video.label}
                  >
                    <source src={video.src} type="video/mp4" />
                    Your browser does not support embedded videos.
                  </video>
                  <p className="px-2 pt-3 font-semibold">{video.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {["The almonds were crisp and clean, perfect for morning soaked almonds.", "Our Diwali gift boxes looked premium and arrived before schedule.", "Cashews and pistachios had the right crunch. Ordering again."].map((quote, index) => (
              <Card key={quote}>
                <CardContent className="p-6">
                  <div className="flex gap-1 text-saffron">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star key={star} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-muted-foreground">&ldquo;{quote}&rdquo;</p>
                  <p className="mt-4 font-semibold">{["Mira S.", "Rohan K.", "Ishita P."][index]}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container grid gap-5 md:grid-cols-2">
          {[
            ["Are your products FSSAI compliant?", "Yes. The store configuration includes the FSSAI number and products are packed using food-safe practices."],
            ["Do you offer COD?", "Yes, Cash on Delivery is available on eligible pincodes. Razorpay is supported for prepaid INR orders."],
            ["How are prices calculated?", "The server recalculates product, coupon, GST, and shipping totals during checkout."],
            ["Can I order corporate gift boxes?", "Yes. Use the gift boxes category or WhatsApp button for bulk customization."]
          ].map(([question, answer]) => (
            <details key={question} className="rounded-lg border bg-card p-5">
              <summary className="cursor-pointer font-semibold">{question}</summary>
              <p className="mt-3 text-sm text-muted-foreground">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
