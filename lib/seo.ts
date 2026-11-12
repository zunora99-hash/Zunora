import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function createMetadata({ title, description, path = "/", image = "/og.svg", keywords, noIndex = false }: SeoInput): Metadata {
  const canonical = absoluteUrl(path);
  const brandedTitle = title.toLowerCase().includes(siteConfig.name.toLowerCase())
    ? title
    : `${title} | ${siteConfig.name}`;
  return {
    title: brandedTitle,
    description,
    keywords,
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
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
    "@type": "OnlineStore",
    name: siteConfig.name,
    alternateName: "Zunora Dry Fruits",
    description: "Shop Zunora dry fruit snacks online, including 25 g cashew packs, from Belagavi, Karnataka.",
    url: siteConfig.url,
    logo: `${siteConfig.url}/favicon.svg`,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Belagavi",
      addressRegion: "Karnataka",
      postalCode: "591109",
      addressCountry: "IN"
    },
    areaServed: ["Belagavi", "Belgaum", "India"]
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
