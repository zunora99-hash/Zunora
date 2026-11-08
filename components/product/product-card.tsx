"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import type { CatalogProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { useCartStore } from "@/stores/cart";

export function ProductCard({ product, index = 0 }: { product: CatalogProduct; index?: number }) {
  const addItem = useCartStore((state) => state.addItem);
  const variant = product.variants[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index * 0.04, 0.24) }}
      className="group overflow-hidden rounded-lg border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden bg-[#f8efe0]">
          <Image src={product.images[0]} alt={`${product.name} pack`} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-contain transition duration-500 group-hover:scale-[1.02]" />
          {product.featured ? <Badge className="absolute left-3 top-3">Available now</Badge> : null}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase text-olive">{product.category}</p>
          {product.reviewCount > 0 ? <span className="text-xs font-semibold">{product.rating} / 5 · {product.reviewCount} reviews</span> : null}
        </div>
        <Link href={`/product/${product.slug}`} className="mt-2 block min-h-12 font-serif text-xl font-semibold leading-tight hover:underline">
          {product.name}
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.shortDescription}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-serif text-2xl font-bold">{formatPrice(variant.price)}</p>
            <p className="text-xs text-muted-foreground">{variant.label} pack</p>
          </div>
          <Button
            size="icon"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => {
              addItem(product, variant, 1);
              toast({ title: "Added to cart", description: `${product.name} ${variant.label}` });
            }}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
