"use client";

import Image from "next/image";
import { RotateCcw, RotateCw } from "lucide-react";
import { useRef, useState, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

type DragStart = { x: number; y: number; rotateX: number; rotateY: number };

export function ProductGallery({ images, video, name, interactive3d = false }: { images: string[]; video?: string; name: string; interactive3d?: boolean }) {
  const [active, setActive] = useState<"image" | "video">("image");
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<DragStart | null>(null);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!interactive3d || active !== "image") return;
    dragStart.current = { x: event.clientX, y: event.clientY, rotateX: rotation.x, rotateY: rotation.y };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    const start = dragStart.current;
    const horizontalDrag = event.clientX - start.x;
    const verticalDrag = event.clientY - start.y;
    setRotation({
      x: event.pointerType === "mouse" ? Math.max(-12, Math.min(12, start.rotateX - verticalDrag * 0.18)) : 0,
      y: Math.max(-32, Math.min(32, start.rotateY + horizontalDrag * 0.22))
    });
  }

  function endPointerDrag() {
    dragStart.current = null;
    setDragging(false);
  }

  return (
    <div className="[perspective:1400px]">
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointerDrag}
        onPointerCancel={endPointerDrag}
        role={interactive3d ? "group" : undefined}
        className={cn(
          "relative aspect-[2/3] overflow-hidden rounded-2xl border bg-[#f8efe0] shadow-[0_24px_55px_-30px_rgba(61,38,24,0.55)] transition-transform duration-500 ease-out",
          interactive3d ? "touch-pan-y cursor-grab active:cursor-grabbing" : "hover:[transform:rotateY(-3deg)_rotateX(1deg)_translateY(-3px)]"
        )}
        style={interactive3d ? { transform: `perspective(1100px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`, transitionDuration: dragging ? "0ms" : "350ms" } : undefined}
        aria-label={interactive3d ? `${name}. Drag horizontally to rotate the product view.` : undefined}
      >
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
      {interactive3d ? (
        <div className="mt-3 flex items-center justify-between rounded-xl border bg-card px-3 py-2.5">
          <p className="text-xs font-medium text-muted-foreground">Drag image to rotate in 3D</p>
          <div className="flex gap-1">
            <button type="button" onClick={() => setRotation((value) => ({ ...value, y: Math.max(-32, value.y - 12) }))} className="grid h-9 w-9 place-items-center rounded-lg transition hover:bg-muted" aria-label="Rotate product left">
              <RotateCcw className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setRotation((value) => ({ ...value, y: Math.min(32, value.y + 12) }))} className="grid h-9 w-9 place-items-center rounded-lg transition hover:bg-muted" aria-label="Rotate product right">
              <RotateCw className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setRotation({ x: 0, y: 0 })} className="rounded-lg px-2 text-xs font-semibold transition hover:bg-muted" aria-label="Reset product rotation">
              Reset
            </button>
          </div>
        </div>
      ) : null}
      {images.length > 1 || video ? <div className="mt-4 grid grid-cols-4 gap-3">
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
      </div> : null}
    </div>
  );
}
