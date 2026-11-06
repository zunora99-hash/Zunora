import { notFound } from "next/navigation";
import { ProductActions } from "@/components/product/product-actions";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug, getRelatedProducts, products } from "@/lib/catalog";
import { createMetadata } from "@/lib/seo";
import { formatPrice, absoluteUrl } from "@/lib/utils";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return createMetadata({
    title: product.name,
    description: product.description,
    path: `/product/${product.slug}`,
    image: product.images[0]
  });
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();
  const related = getRelatedProducts(product);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.variants[0].id,
    brand: { "@type": "Brand", name: "Zunora" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: product.variants[0].price,
      highPrice: product.variants[product.variants.length - 1].price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/product/${product.slug}`)
    }
  };

  return (
    <div className="container py-10">
      <nav className="text-sm text-muted-foreground">
        Home / Shop / {product.category} / <span className="text-foreground">{product.name}</span>
      </nav>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.9fr]">
        <ProductGallery images={product.images} name={product.name} />
        <div>
          <Badge>{product.category}</Badge>
          <h1 className="mt-4 font-serif text-5xl font-bold leading-tight">{product.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-semibold">
            <span>{product.rating} / 5 rating</span>
            <span>{product.reviewCount} reviews</span>
            <span>Starts at {formatPrice(product.variants[0].price)}</span>
          </div>
          <div className="mt-7">
            <ProductActions product={product} />
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {Object.entries(product.nutrition).map(([key, value]) => (
              <div key={key} className="rounded-lg border bg-card p-4">
                <p className="text-xs font-bold uppercase text-muted-foreground">{key}</p>
                <p className="mt-1 font-serif text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-7 rounded-lg border bg-card p-5">
            <h2 className="font-serif text-2xl font-semibold">Details</h2>
            <p className="mt-3 text-sm text-muted-foreground">Ingredients: {product.ingredients}</p>
            <p className="mt-2 text-sm text-muted-foreground">Origin: {product.origin}</p>
          </div>
        </div>
      </div>
      <section className="section">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Reviews</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Loved by everyday snackers</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {["Fresh, crunchy and well packed.", "The 1kg pack was great value and tasted premium."].map((review) => (
            <div key={review} className="rounded-lg border bg-card p-5">
              <p className="font-semibold">★★★★★</p>
              <p className="mt-2 text-muted-foreground">{review}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="pb-12">
        <h2 className="font-serif text-3xl font-bold">Related products</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item, index) => (
            <ProductCard key={item.id} product={item} index={index} />
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
    </div>
  );
}
