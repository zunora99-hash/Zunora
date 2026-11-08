import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { storefrontProducts } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    "", "/shop", "/about", "/contact", "/privacy", "/terms", "/shipping-returns",
    ...storefrontProducts.map((product) => `/product/${product.slug}`)
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: path.startsWith("/product") ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7
  }));
}
