import type { ReactNode } from "react";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Cart",
  description: "Review your Zunora dry fruits cart.",
  path: "/cart",
  noIndex: true
});

export default function CartLayout({ children }: { children: ReactNode }) {
  return children;
}
