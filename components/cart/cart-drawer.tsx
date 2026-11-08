"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCartTotals, useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { freeGiftProduct, getFreeGiftQuantity } from "@/lib/catalog";

export function CartDrawer() {
  const pathname = usePathname();
  const { items, drawerOpen, setDrawerOpen, updateQuantity, removeItem } = useCartStore();
  const totals = getCartTotals(items);
  const freeGiftQuantity = getFreeGiftQuantity(items);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname, setDrawerOpen]);

  return (
    <>
      {drawerOpen ? <button aria-label="Close cart" className="fixed inset-0 z-[60] bg-cacao/40" onClick={() => setDrawerOpen(false)} /> : null}
      <aside
        className={`fixed right-0 top-0 z-[70] h-dvh w-full max-w-md transform bg-background shadow-soft transition duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!drawerOpen}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-5">
            <p className="font-serif text-2xl font-semibold">Your cart</p>
            <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)} aria-label="Close cart">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {items.length ? (
              <div className="grid gap-4">
                {freeGiftProduct && freeGiftQuantity > 0 ? (
                  <p className="rounded-md border border-olive/30 bg-olive/5 p-3 text-sm text-olive">
                    {freeGiftQuantity} free 15 g Pista & Cashew Mix added at checkout.
                  </p>
                ) : null}
                {items.map((item) => (
                  <div key={item.variantId} className="grid grid-cols-[72px_1fr] gap-4 rounded-lg border p-3">
                    <Image src={item.image} alt={item.name} width={72} height={72} className="h-18 w-18 rounded-md object-cover" />
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/product/${item.slug}`} className="font-semibold hover:underline">
                            {item.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">{item.variant}</p>
                        </div>
                        <button aria-label="Remove item" onClick={() => removeItem(item.variantId)}>
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-md border">
                          <button className="p-2" aria-label="Decrease quantity" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button className="p-2" aria-label="Increase quantity" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <p className="font-serif text-2xl font-semibold">Your basket is empty</p>
                  <p className="mt-2 text-sm text-muted-foreground">Add a Zunora 25 g cashew pack to your basket.</p>
                  <Button className="mt-5" asChild onClick={() => setDrawerOpen(false)}>
                    <Link href="/shop">Start shopping</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="border-t p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-serif text-2xl font-semibold">{formatPrice(totals.subtotal)}</span>
            </div>
            <Button className="w-full" asChild disabled={!items.length} onClick={() => setDrawerOpen(false)}>
              <Link href="/checkout">Checkout</Link>
            </Button>
            <Button variant="link" className="mt-2 w-full" asChild onClick={() => setDrawerOpen(false)}>
              <Link href="/cart">View full cart</Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
