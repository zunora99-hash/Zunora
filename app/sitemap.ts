import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { storefrontProducts } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "", "/shop", "/dry-fruits-belgaum", "/about", "/contact", "/privacy", "/terms", "/shipping-returns",
    ...storefrontProducts.map((product) => `/product/${product.slug}`)
  ].map((path) => ({ url: `${siteConfig.url}${path}` }));
}
