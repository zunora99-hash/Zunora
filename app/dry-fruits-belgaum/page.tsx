import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { storefrontProducts } from "@/lib/catalog";
import { createMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";

export const metadata = createMetadata({
  title: "Dry Fruits in Belagavi (Belgaum) | Order Zunora Online",
  description: "Shop Zunora dry fruit snacks online in Belagavi, also known as Belgaum. Browse 25 g cashew packs, delivery details, and current offers.",
  path: "/dry-fruits-belgaum",
  image: "/products/zunora-salted-cashew-25g.png",
  keywords: ["dry fruits in Belagavi", "dry fruits in Belgaum", "cashews Belagavi", "Zunora"]
});

export default function BelagaviDryFruitsPage() {
  const products = storefrontProducts.filter((product) => product.categorySlug === "cashews");
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Dry fruits in Belagavi", item: absoluteUrl("/dry-fruits-belgaum") }
    ]
  };

  return (
    <>
      <section className="bg-gradient-to-br from-[#fbf5e9] via-[#f8efe0] to-[#ead9bd]">
        <div className="container py-14 md:py-20">
          <p className="eyebrow">Belagavi · Belgaum · Karnataka</p>
          <h1 className="mt-3 max-w-4xl font-serif text-5xl font-bold leading-tight md:text-6xl">
            Dry fruits in Belagavi (Belgaum), from Zunora
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
            Zunora is a Belagavi-based online dry fruits brand. Shop our current range of 25 g cashew snack packs in Salted, Peri Peri Masala, and Raw & Natural flavours. Belagavi is also known as Belgaum, and both names refer to the city we call home.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="#cashew-packs">Browse cashew packs <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/shipping-returns">View delivery information</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="cashew-packs" className="section scroll-mt-24">
        <div className="container">
          <p className="eyebrow">Available online</p>
          <h2 className="mt-2 font-serif text-4xl font-bold">Zunora 25 g cashew packs</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Each available pack is ₹40. During the current offer, one 15 g Pista & Cashew Mix is added free for each eligible cashew pack at checkout. Check the package for ingredients, allergens, and nutrition information.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
          </div>
        </div>
      </section>

      <section className="section bg-white/45">
        <div className="container grid gap-8 md:grid-cols-2">
          <div>
            <p className="eyebrow">Ordering and delivery</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Order online for Belagavi delivery</h2>
            <p className="mt-4 text-muted-foreground">
              Add the packs you want to your cart and enter your delivery address at checkout. Delivery is free for orders of ₹100 or more; orders below ₹100 have a ₹25 delivery charge. Available payment methods are shown at checkout.
            </p>
            <p className="mt-4 text-muted-foreground">
              The store currently focuses on compact cashew snack packs. Other dry fruit ranges will be listed here when they become available.
            </p>
          </div>
          <div>
            <p className="eyebrow">Common questions</p>
            <div className="mt-3 grid gap-3">
              <details className="rounded-lg border bg-card p-4">
                <summary className="cursor-pointer font-semibold">Is Belgaum the same city as Belagavi?</summary>
                <p className="mt-2 text-sm text-muted-foreground">Yes. Belagavi is also commonly called Belgaum. This page serves customers searching with either name.</p>
              </details>
              <details className="rounded-lg border bg-card p-4">
                <summary className="cursor-pointer font-semibold">What dry fruits can I order now?</summary>
                <p className="mt-2 text-sm text-muted-foreground">Zunora currently offers Salted, Peri Peri Masala, and Raw & Natural cashew snack packs in 25 g sizes.</p>
              </details>
              <details className="rounded-lg border bg-card p-4">
                <summary className="cursor-pointer font-semibold">How much does delivery cost?</summary>
                <p className="mt-2 text-sm text-muted-foreground">Delivery is free at ₹100 or more and ₹25 for orders below ₹100. The final amount, including applicable GST, is shown at checkout.</p>
              </details>
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );
}
