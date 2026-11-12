"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCartTotals, useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { freeGiftProduct, getFreeGiftQuantity } from "@/lib/catalog";
import { getDeliveryCharge } from "@/lib/pricing";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const totals = getCartTotals(items);
  const freeGiftQuantity = getFreeGiftQuantity(items);

  return (
    <div className="container py-10">
      <h1 className="font-serif text-5xl font-bold">Cart</h1>
      {items.length ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-4">
            {freeGiftProduct && freeGiftQuantity > 0 ? (
              <div className="flex items-center gap-4 rounded-lg border border-olive/30 bg-olive/5 p-4">
                <Image src={freeGiftProduct.images[0]} alt={freeGiftProduct.name} width={64} height={64} className="h-16 w-16 rounded-md object-cover" />
                <p className="text-sm"><strong>{freeGiftQuantity} free 15 g Pista & Cashew Mix</strong> will be added to your order at checkout.</p>
              </div>
            ) : null}
            {items.map((item) => (
              <div key={item.variantId} className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-[96px_1fr_auto]">
                <Image src={item.image} alt={item.name} width={96} height={96} className="h-24 w-24 rounded-md object-cover" />
                <div>
                  <Link href={`/product/${item.slug}`} className="font-serif text-xl font-semibold hover:underline">{item.name}</Link>
                  <p className="mt-1 text-sm text-muted-foreground">{item.variant}</p>
                  <div className="mt-4 flex w-fit items-center rounded-md border">
                    <button className="p-3" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <button className="p-3" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                  <p className="font-serif text-2xl font-bold">{formatPrice(item.price * item.quantity)}</p>
                  <Button className="mt-3" variant="ghost" size="icon" onClick={() => removeItem(item.variantId)} aria-label="Remove item"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-lg border bg-card p-5">
            <h2 className="font-serif text-2xl font-semibold">Summary</h2>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-serif text-3xl font-bold">{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-semibold">{getDeliveryCharge(totals.subtotal) === 0 ? "Free" : formatPrice(getDeliveryCharge(totals.subtotal))}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Free delivery on orders of ₹100 or more. Orders below ₹100 have a ₹25 delivery charge. GST and coupons are calculated at checkout.</p>
            <Button className="mt-5 w-full" asChild><Link href="/checkout">Checkout</Link></Button>
          </aside>
        </div>
      ) : (
        <div className="grid min-h-96 place-items-center text-center">
          <div>
            <h2 className="font-serif text-3xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Browse Zunora 25 g cashew packs.</p>
            <Button className="mt-5" asChild><Link href="/shop">Shop now</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}
