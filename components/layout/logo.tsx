import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label={`${siteConfig.name} home`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-serif text-sm font-bold text-primary-foreground">
        {siteConfig.logo.mark}
      </span>
      <span className="leading-tight">
        <span className="block font-serif text-xl font-bold text-cacao">{siteConfig.logo.text}</span>
        <span className="hidden text-xs text-muted-foreground sm:block">{siteConfig.tagline}</span>
      </span>
    </Link>
  );
}
