"use client";

import { useState } from "react";

export type AdminStockVariant = { id: string; label: string; stock: number };
export type AdminStockProduct = { id: string; name: string; slug: string; category: string; variants: AdminStockVariant[] };

export function StockEditor({ products }: { products: AdminStockProduct[] }) {
  const [stocks, setStocks] = useState<Record<string, number>>(() => Object.fromEntries(products.flatMap((product) => product.variants.map((variant) => [variant.id, variant.stock]))));
  const [busy, setBusy] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});

  async function save(variantId: string) {
    setBusy(variantId);
    setMessages((current) => ({ ...current, [variantId]: "Saving…" }));
    try {
      const response = await fetch(`/api/admin/variants/${encodeURIComponent(variantId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: stocks[variantId] })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not update stock.");
      setMessages((current) => ({ ...current, [variantId]: "Saved" }));
    } catch (error) {
      setMessages((current) => ({ ...current, [variantId]: error instanceof Error ? error.message : "Could not update stock." }));
    } finally {
      setBusy(null);
    }
  }

  return <div className="mt-6 grid gap-4">
    {products.map((product) => <section key={product.id} className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-xl font-bold">{product.name}</h2>
        <span className="text-sm text-muted-foreground">{product.category} · /{product.slug}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {product.variants.map((variant) => <div key={variant.id} className="grid grid-cols-[1fr_92px_auto] items-center gap-2 rounded-lg border p-3">
          <label htmlFor={`stock-${variant.id}`} className="text-sm font-medium">{variant.label}</label>
          <input id={`stock-${variant.id}`} type="number" min="0" max="1000000" step="1" value={stocks[variant.id] ?? 0} onChange={(event) => setStocks((current) => ({ ...current, [variant.id]: Number(event.target.value) }))} className="h-10 w-full rounded-md border bg-background px-2 text-sm" />
          <button type="button" onClick={() => void save(variant.id)} disabled={busy === variant.id || !Number.isInteger(stocks[variant.id]) || stocks[variant.id] < 0} className="h-10 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy === variant.id ? "…" : "Save"}</button>
          {messages[variant.id] ? <p role="status" className="col-span-3 text-xs text-muted-foreground">{messages[variant.id]}</p> : null}
        </div>)}
        {!product.variants.length ? <p className="text-sm text-muted-foreground">No variants configured.</p> : null}
      </div>
    </section>)}
    {!products.length ? <p className="rounded-lg border p-6 text-sm text-muted-foreground">No catalog products found.</p> : null}
  </div>;
}
