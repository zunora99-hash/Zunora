"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function ScratchCard({ rewardCode, customerId }: { rewardCode: string; customerId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#b7c08a");
    gradient.addColorStop(1, "#7f8d50");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.font = "700 22px Arial";
    context.fillText("SCRATCH TO REVEAL", canvas.width / 2, canvas.height / 2 - 5);
    context.font = "14px Arial";
    context.fillText("Your 5% reward", canvas.width / 2, canvas.height / 2 + 24);
  }, []);

  function erase(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || revealed) return;
    const canvas = event.currentTarget;
    const context = canvas.getContext("2d");
    if (!context) return;
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * (canvas.width / bounds.width);
    const y = (event.clientY - bounds.top) * (canvas.height / bounds.height);
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(x, y, 22, 0, Math.PI * 2);
    context.fill();

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let clearPixels = 0;
    let sampledPixels = 0;
    for (let index = 3; index < pixels.length; index += 4 * 8) {
      sampledPixels += 1;
      if (pixels[index] < 24) clearPixels += 1;
    }
    if (clearPixels / sampledPixels > 0.42) setRevealed(true);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(rewardCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="relative h-44 overflow-hidden rounded-lg border bg-cream">
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-semibold text-muted-foreground">5% off your next order</p>
          <p className="font-mono text-xl font-bold tracking-widest">{revealed ? rewardCode : "ZUN5-••••••••••••••••"}</p>
          {revealed ? <p className="text-xs text-muted-foreground">Enter this code at checkout. It can be used once.</p> : null}
        </div>
        {!revealed ? (
          <canvas
            ref={canvasRef}
            width={360}
            height={176}
            className="absolute inset-0 h-full w-full touch-none"
            onPointerDown={(event) => { drawing.current = true; event.currentTarget.setPointerCapture(event.pointerId); erase(event); }}
            onPointerMove={erase}
            onPointerUp={() => { drawing.current = false; }}
            onPointerCancel={() => { drawing.current = false; }}
            aria-label="Scratch this card to reveal your 5% reward code"
          />
        ) : null}
      </div>
      {revealed ? (
        <>
          <Button type="button" variant="outline" onClick={copyCode}>{copied ? "Code copied" : "Copy reward code"}</Button>
          <p className="text-xs text-muted-foreground">Your reward ID: <span className="font-mono">{customerId}</span></p>
        </>
      ) : <Button type="button" variant="outline" onClick={() => setRevealed(true)}>Tap to reveal</Button>}
    </div>
  );
}
