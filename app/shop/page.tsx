import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, filterProducts } from "@/lib/catalog";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Shop Dry Fruits",
  description: "Filter and buy premium almonds, cashews, pistachios, dates, figs, walnuts, raisins, and dry fruits gift boxes online.",
  path: "/shop"
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
          <h1 className="mt-2 font-serif text-5xl font-bold">Buy dry fruits online</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Premium almonds, cashews, pistachios, walnuts, dates, figs, and dry fruits gift boxes with smart filters.</p>
        </div>
        <p className="text-sm font-semibold text-muted-foreground">{selected.length} products</p>
      </div>
      <form className="mt-8 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <Input name="q" defaultValue={searchParams.q} placeholder="Search products" aria-label="Search products" />
        <select name="category" defaultValue={searchParams.category ?? ""} className="h-11 rounded-md border bg-background px-3 text-sm">
          <option value="">All categories</option>
          {categories.map((category) => (
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
        {categories.map((category) => (
          <Button key={category.slug} variant={searchParams.category === category.slug ? "default" : "outline"} size="sm" asChild>
            <Link href={`/shop?category=${category.slug}`}>{category.name}</Link>
          </Button>
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
            <h2 className="font-serif text-3xl font-bold">No products found</h2>
            <p className="mt-2 text-muted-foreground">Try another search or reset filters.</p>
            <Button className="mt-5" asChild>
              <Link href="/shop">Reset shop</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
