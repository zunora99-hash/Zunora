import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Gift } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { freeGiftProduct, storefrontCategories, storefrontProducts } from "@/lib/catalog";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Buy Dry Fruits Online in India | Cashew Packs",
  description: "Shop Zunora 25 g salted, peri peri masala, and raw cashew snack packs for ₹40 each. Get a free 15 g Pista & Cashew Mix with each cashew pack during this limited-time offer. Almonds coming soon.",
  path: "/",
  image: "/products/zunora-salted-cashew-25g.png",
  keywords: ["buy dry fruits online India", "Zunora dry fruits", "cashew snacks", "25 g cashew pack", "peri peri cashew", "salted cashews"]
});

export default function HomePage() {
  const bestSellers = storefrontProducts.filter((product) => product.featured);

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
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {storefrontCategories.map((category) => (
              category.comingSoon ? (
                <div key={category.slug} className="relative grid min-h-56 place-items-center overflow-hidden rounded-lg border bg-cacao p-6 text-center text-white">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-saffron">Coming soon</p>
                    <h3 className="mt-2 font-serif text-3xl font-bold">{category.name}</h3>
                    <p className="mt-2 text-sm text-white/80">{category.description}</p>
                  </div>
                </div>
              ) : (
                <Link key={category.slug} href={`/shop?category=${category.slug}`} className="group relative min-h-56 overflow-hidden rounded-lg border bg-card">
                  <Image src={category.image} alt={`Zunora ${category.name.toLowerCase()} snack packs`} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-cacao/80 to-cacao/5" />
                  <div className="absolute bottom-0 p-5 text-white">
                    <h3 className="font-serif text-2xl font-bold">{category.name}</h3>
                    <p className="mt-1 max-w-sm text-sm text-white/80">{category.description}</p>
                  </div>
                </Link>
              )
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-white/45">
        <div className="container">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="eyebrow">Available now</p>
              <h2 className="mt-2 font-serif text-4xl font-bold">Zunora 25 g cashew snack packs</h2>
            </div>
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link href="/shop">Shop all</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bestSellers.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>
      {freeGiftProduct ? (
        <section className="section">
          <div className="container grid items-center gap-8 rounded-lg border bg-white/70 p-6 md:grid-cols-2 md:p-10">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg bg-card shadow-[0_24px_55px_-30px_rgba(61,38,24,0.55)] transition-transform duration-500 ease-out hover:[transform:perspective(1200px)_rotateY(-4deg)_rotateX(2deg)_translateY(-3px)]">
              {freeGiftProduct.video ? (
                <video src={freeGiftProduct.video} aria-label="Zunora Pista & Cashew Mix 15 g product video" autoPlay muted loop playsInline controls className="h-full w-full object-contain" />
              ) : (
                <Image src={freeGiftProduct.images[0]} alt="Zunora Pista & Cashew Mix 15 g free gift pack" fill sizes="(min-width: 768px) 40vw, 90vw" className="object-contain" />
              )}
            </div>
            <div>
              <p className="eyebrow flex items-center gap-2"><Gift className="h-4 w-4" /> Limited-time gift</p>
              <h2 className="mt-3 font-serif text-4xl font-bold">A little extra in every cashew pack.</h2>
              <p className="mt-4 text-muted-foreground">Add a Zunora 25 g cashew pack and receive one 15 g Pista & Cashew Mix free. The gift is added automatically at checkout, one per eligible pack, during this limited-time offer.</p>
              <Button className="mt-6" asChild>
                <Link href="/shop?category=cashews">Shop cashew packs <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}
      <section className="section bg-white/45">
        <div className="container">
          <p className="eyebrow text-center">Shop with confidence</p>
          <h2 className="mt-2 text-center font-serif text-4xl font-bold">Clear packs. Simple prices.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">Choose from three 25 g Zunora cashew packs for ₹40 each. Review the product packaging for ingredients, allergens, and nutrition information before consuming.</p>
        </div>
      </section>
      <section className="section">
        <div className="container grid gap-5 md:grid-cols-2">
          {[
            ["Which cashew packs can I buy?", "Zunora Salted Cashew, Peri Peri Masala Cashew, and Raw & Natural Cashew are available in 25 g packs for ₹40 each."],
            ["How does the free gift work?", "One 15 g Pista & Cashew Mix is added automatically for each eligible 25 g cashew pack during this limited-time offer."],
            ["Are almonds available?", "Zunora almonds are coming soon."],
            ["Where can I check ingredients and allergens?", "Please read the information printed on each product package."]
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
