"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CatalogProduct, CatalogVariant } from "@/lib/catalog";

export type CartItem = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  image: string;
  variant: string;
  price: number;
  mrp: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  drawerOpen: boolean;
  addItem: (product: CatalogProduct, variant: CatalogVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  setDrawerOpen: (open: boolean) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false,
      addItem: (product, variant, quantity = 1) =>
        set((state) => {
          const safeQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
          const existing = state.items.find(
            (item) => item.productId === product.id && item.variantId === variant.id
          );
          if (existing) {
            return {
              drawerOpen: true,
              items: state.items.map((item) =>
                item.productId === product.id && item.variantId === variant.id
                  ? {
                      ...item,
                      name: product.name,
                      slug: product.slug,
                      image: product.images[0],
                      variant: variant.label,
                      price: variant.price,
                      mrp: variant.mrp,
                      quantity: Math.min(variant.stock, item.quantity + safeQuantity)
                    }
                  : item
              )
            };
          }
          return {
            drawerOpen: true,
            items: [
              ...state.items,
              {
                productId: product.id,
                variantId: variant.id,
                slug: product.slug,
                name: product.name,
                image: product.images[0],
                variant: variant.label,
                price: variant.price,
                mrp: variant.mrp,
                quantity: Math.min(variant.stock, safeQuantity)
              }
            ]
          };
        }),
      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((item) => item.variantId !== variantId) })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId
              ? { ...item, quantity: Math.max(1, Math.floor(quantity)) }
              : item
          )
        })),
      clear: () => set({ items: [] }),
      setDrawerOpen: (drawerOpen) => set({ drawerOpen })
    }),
    { name: "nutrinest-cart" }
  )
);

export function getCartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, count };
}
