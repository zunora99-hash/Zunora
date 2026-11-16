import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";

export function Logo() {
  return (
    <Link href="/" className="shrink-0" aria-label={`${siteConfig.name} home`}>
      <picture className="relative block h-12 w-12 md:h-16 md:w-24">
        <source
          media="(max-width: 767px)"
          srcSet="/_next/image?url=%2Fbrand%2Fzunora-mobile.png&w=128&q=75 1x, /_next/image?url=%2Fbrand%2Fzunora-mobile.png&w=256&q=75 2x"
        />
        <Image
          src="/brand/zunora-desktop.png"
          alt="Zunora Premium Dry Fruits"
          width={1536}
          height={1024}
          sizes="(max-width: 767px) 48px, 96px"
          loading="eager"
          className="h-full w-full object-contain"
        />
      </picture>
    </Link>
  );
}
