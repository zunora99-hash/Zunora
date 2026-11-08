"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useCartStore } from "@/stores/cart";

export function ProductActions({ product }: { product: CatalogProduct }) {
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const selected = useMemo(() => product.variants.find((variant) => variant.id === variantId) ?? product.variants[0], [product.variants, variantId]);

  return (
    <div className="rounded-lg border bg-card p-5">
      {product.variants.length > 1 ? (
        <>
          <p className="text-sm font-semibold">Choose pack size</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setVariantId(variant.id)}
                className={cn(
                  "rounded-md border p-3 text-left transition hover:border-primary",
                  selected.id === variant.id && "border-primary bg-muted"
                )}
              >
                <span className="block font-semibold">{variant.label}</span>
                <span className="text-sm text-muted-foreground">{formatPrice(variant.price)}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm font-semibold">{selected.label} pack</p>
      )}
      {product.eligibleForFreeGift ? (
        <p className="mt-3 rounded-md bg-olive/5 p-3 text-sm text-olive">
          Limited-time offer: one free 15 g Pista & Cashew Mix with each pack, added automatically at checkout.
        </p>
      ) : null}
      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="font-serif text-3xl font-bold">{formatPrice(selected.price)}</p>
          <p className="text-sm text-muted-foreground">
            {selected.stock > 0 ? "In stock" : "Out of stock"}
          </p>
        </div>
        <div className="flex items-center rounded-md border">
          <button className="p-3" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-semibold">{quantity}</span>
          <button className="p-3" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <Button
        className="mt-5 w-full"
        size="lg"
        disabled={selected.stock <= 0}
        onClick={() => {
          addItem(product, selected, quantity);
          toast({ title: "Cart updated", description: `${quantity} x ${product.name} ${selected.label}` });
        }}
      >
        <ShoppingBag className="h-4 w-4" />
        Add to cart
      </Button>
    </div>
  );
}
