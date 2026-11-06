"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(images[0]);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
        <Image src={active} alt={`${name} product image`} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition duration-500 hover:scale-110" />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {images.map((image) => (
          <button
            key={image}
            onClick={() => setActive(image)}
            className={cn("relative aspect-square overflow-hidden rounded-md border", active === image && "ring-2 ring-ring")}
            aria-label={`View ${name} image`}
          >
            <Image src={image} alt={`${name} thumbnail`} fill sizes="120px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
