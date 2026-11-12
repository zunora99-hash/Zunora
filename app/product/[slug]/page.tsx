import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/product/product-actions";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug, getRelatedProducts, storefrontProducts } from "@/lib/catalog";
import { createMetadata } from "@/lib/seo";
import { formatPrice, absoluteUrl } from "@/lib/utils";

export function generateStaticParams() {
  return storefrontProducts.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return createMetadata({
    title: product.name,
    description: `${product.description} Order online from Zunora in Belagavi (Belgaum) or elsewhere in India.`,
    path: `/product/${product.slug}`,
    image: product.images[0],
    keywords: [product.name, "buy cashews online", "Zunora dry fruits", "25 g cashew pack"]
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
    image: product.images.map(absoluteUrl),
    description: product.description,
    sku: product.variants[0].id,
    brand: { "@type": "Brand", name: "Zunora" },
    ...(product.reviewCount > 0 ? {
      aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount }
    } : {}),
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      price: variant.price,
      priceCurrency: "INR",
      availability: product.variants.some((variant) => variant.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url: absoluteUrl(`/product/${product.slug}`),
      sku: variant.id
    }))
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Cashew packs", item: absoluteUrl("/shop?category=cashews") },
      { "@type": "ListItem", position: 3, name: product.name, item: absoluteUrl(`/product/${product.slug}`) }
    ]
  };

  return (
    <div className="container py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">Home</Link> / <Link href="/shop?category=cashews" className="hover:underline">Cashew packs</Link> / <span className="text-foreground">{product.name}</span>
      </nav>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.9fr]">
        <ProductGallery images={product.images} video={product.video} name={product.name} />
        <div>
          <Badge>{product.category}</Badge>
          <h1 className="mt-4 font-serif text-5xl font-bold leading-tight">{product.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>
          {product.reviewCount > 0 ? (
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-semibold">
              <span>{product.rating} / 5 rating</span>
              <span>{product.reviewCount} reviews</span>
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-semibold">
            <span>{formatPrice(product.variants[0].price)} / {product.variants[0].label}</span>
          </div>
          <div className="mt-7">
            <ProductActions product={product} />
          </div>
          {product.eligibleForFreeGift ? (
            <p className="mt-5 rounded-lg border border-olive/30 bg-olive/5 p-4 text-sm font-medium text-olive">
              Get one free 15 g Pista & Cashew Mix with each 25 g pack during this limited-time offer. The gift is added automatically at checkout.
            </p>
          ) : null}
          <div className="mt-7 rounded-lg border bg-card p-5">
            <h2 className="font-serif text-2xl font-semibold">Details</h2>
            <p className="mt-3 text-sm text-muted-foreground">Ingredients: {product.ingredients}</p>
            <p className="mt-2 text-sm text-muted-foreground">Origin: {product.origin}</p>
          </div>
        </div>
      </div>
      <section className="pb-12">
        <h2 className="font-serif text-3xl font-bold">Related products</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item, index) => (
            <ProductCard key={item.id} product={item} index={index} />
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </div>
  );
}
