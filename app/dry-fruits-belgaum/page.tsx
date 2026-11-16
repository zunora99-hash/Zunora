import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { storefrontProducts } from "@/lib/catalog";
import { createMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";

export const metadata = createMetadata({
  title: "Buy Dry Fruits Online in Belagavi & Belgaum | Zunora",
  description: "Order dry fruits online from Zunora in Belagavi (Belgaum), Karnataka. Shop 30 g cashew jars for ₹59, 25 g snack packs, and delivery information.",
  path: "/dry-fruits-belgaum",
  image: "/products/zunora-salted-cashew-jar-30g.webp",
  keywords: ["dry fruits shop Belagavi", "dry fruits delivery Belagavi", "buy dry fruits online Belgaum", "cashews Belagavi", "Zunora"]
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
            Zunora is a Belagavi-based online dry fruits brand. Shop 30 g cashew jars and 25 g snack packs in a range of flavours. Belagavi is also known as Belgaum, and both names refer to the city we call home.
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
          <h2 className="mt-2 font-serif text-4xl font-bold">Zunora cashew jars and 25 g packs</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Zunora 30 g cashew jars are ₹59 each, and 25 g snack packs are ₹40 each. During the current offer, one 15 g Pista & Cashew Mix is added free for each eligible 25 g pack at checkout. Check each package for ingredients, allergens, and nutrition information.
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
              The store currently focuses on cashews in jars and compact snack packs. Other dry fruit ranges will be listed here when they become available.
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
                <p className="mt-2 text-sm text-muted-foreground">Zunora offers 30 g Cashew Nuts, Salted Cashew, Peri Peri Masala Cashew, and Pudina Cashew Mix jars for ₹59 each, plus 25 g Salted, Peri Peri Masala, and Raw & Natural cashew packs for ₹40 each.</p>
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
