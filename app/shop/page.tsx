import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filterProducts, storefrontCategories } from "@/lib/catalog";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Shop Zunora Dry Fruits in Belagavi | Cashew Packs",
  description: "Order Zunora 25 g cashew packs online in Belagavi (Belgaum) and across India. Choose Salted, Peri Peri Masala, or Raw & Natural for ₹40 each.",
  path: "/shop",
  image: "/products/zunora-salted-cashew-25g.png",
  keywords: ["buy cashews online", "dry fruits Belagavi", "dry fruits Belgaum", "Zunora cashew packs", "25 g cashew"]
});

type ShopParams = {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  sort?: string;
};

export default function ShopPage({ searchParams }: { searchParams: ShopParams }) {
  const selected = filterProducts({
    q: searchParams.q,
    category: searchParams.category,
    min: searchParams.min ? Number(searchParams.min) : undefined,
    max: searchParams.max ? Number(searchParams.max) : undefined,
    sort: searchParams.sort
  });

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Shop</p>
          <h1 className="mt-2 font-serif text-5xl font-bold">Shop Zunora cashew packs</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Order online from Belagavi (Belgaum) or elsewhere in India. Three 25 g cashew flavours are available for ₹40 each, with one free 15 g Pista & Cashew Mix for each eligible pack during this limited-time offer.</p>
        </div>
        <p className="text-sm font-semibold text-muted-foreground">{selected.length} products</p>
      </div>
      <form className="mt-8 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <Input name="q" defaultValue={searchParams.q} placeholder="Search products" aria-label="Search products" />
        <select name="category" defaultValue={searchParams.category ?? ""} className="h-11 rounded-md border bg-background px-3 text-sm">
          <option value="">All categories</option>
          {storefrontCategories.map((category) => (
            <option key={category.slug} value={category.slug}>{category.name}</option>
          ))}
        </select>
        <Input name="min" defaultValue={searchParams.min} placeholder="Min price" type="number" />
        <select name="sort" defaultValue={searchParams.sort ?? ""} className="h-11 rounded-md border bg-background px-3 text-sm">
          <option value="">Recommended</option>
          <option value="price-asc">Price low to high</option>
          <option value="price-desc">Price high to low</option>
          <option value="rating">Highest rated</option>
          <option value="newest">Newest</option>
        </select>
        <Button type="submit">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </Button>
      </form>
      <div className="mt-6 flex flex-wrap gap-2">
        {storefrontCategories.map((category) => (
          category.comingSoon ? (
            <Button key={category.slug} variant="outline" size="sm" asChild>
              <Link href={`/shop?category=${category.slug}`}>{category.name} · Coming soon</Link>
            </Button>
          ) : (
            <Button key={category.slug} variant={searchParams.category === category.slug ? "default" : "outline"} size="sm" asChild>
              <Link href={`/shop?category=${category.slug}`}>{category.name}</Link>
            </Button>
          )
        ))}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {selected.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
      {!selected.length ? (
        <div className="grid min-h-80 place-items-center text-center">
          <div>
            <h2 className="font-serif text-3xl font-bold">
              {storefrontCategories.find((category) => category.slug === searchParams.category)?.comingSoon
                ? "Almonds are coming soon"
                : "No products found"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {storefrontCategories.find((category) => category.slug === searchParams.category)?.comingSoon
                ? "We’re preparing the Zunora almond range. Shop our cashew packs in the meantime."
                : "Try another search or reset filters."}
            </p>
            <Button className="mt-5" asChild>
              <Link href="/shop">Reset shop</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
