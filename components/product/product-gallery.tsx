"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, video, name }: { images: string[]; video?: string; name: string }) {
  const [active, setActive] = useState<"image" | "video">("image");

  return (
    <div className="[perspective:1400px]">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border bg-[#f8efe0] shadow-[0_24px_55px_-30px_rgba(61,38,24,0.55)] transition-transform duration-500 ease-out hover:[transform:rotateY(-3deg)_rotateX(1deg)_translateY(-3px)]">
        {active === "video" && video ? (
          <video
            key={video}
            src={video}
            aria-label={`${name} product video`}
            controls
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-contain"
          />
        ) : (
          <Image src={images[0]} alt={`${name} product image`} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain" />
        )}
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            onClick={() => setActive("image")}
            className={cn("relative aspect-[2/3] overflow-hidden rounded-md border bg-[#f8efe0] transition-transform duration-300 hover:-translate-y-1", active === "image" && "ring-2 ring-ring")}
            aria-label={`View ${name} image`}
            aria-pressed={active === "image"}
          >
            <Image src={image} alt={`${name} thumbnail`} fill sizes="120px" className="object-contain" />
          </button>
        ))}
        {video ? (
          <button
            type="button"
            onClick={() => setActive("video")}
            className={cn("relative grid aspect-[2/3] place-items-center overflow-hidden rounded-md border bg-cacao text-white transition-transform duration-300 hover:-translate-y-1", active === "video" && "ring-2 ring-ring")}
            aria-label={`Play ${name} product video`}
            aria-pressed={active === "video"}
          >
            <span className="absolute inset-0 bg-gradient-to-br from-cacao via-olive to-[#d89822] opacity-80" />
            <span className="relative text-center">
              <span className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-white/70 text-sm">▶</span>
              <span className="mt-2 block text-xs font-semibold">Watch video</span>
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
