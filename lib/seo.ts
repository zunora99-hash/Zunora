import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
};

export function createMetadata({ title, description, path = "/", image = "/og.svg", keywords }: SeoInput): Metadata {
  const canonical = absoluteUrl(path);
  const brandedTitle = title.toLowerCase().startsWith(`${siteConfig.name.toLowerCase()} `)
    ? title
    : `${title} | ${siteConfig.name}`;
  return {
    title: brandedTitle,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title: brandedTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      images: [{ url: absoluteUrl(image), alt: title }],
      locale: "en_IN",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: [absoluteUrl(image)]
    }
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.svg`,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}
