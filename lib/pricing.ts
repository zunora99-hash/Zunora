import { siteConfig } from "@/config/site";

export type ServerCartItem = {
  price: number;
  quantity: number;
};

export function getDeliveryCharge(subtotal: number) {
  return subtotal >= siteConfig.shipping.freeAbove || subtotal <= 0
    ? 0
    : siteConfig.shipping.flatFee;
}

export function calculateTotals(items: ServerCartItem[], discount = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = getDeliveryCharge(subtotal);
  const taxable = Math.max(0, subtotal - discount);
  const gst = Math.round(taxable * siteConfig.shipping.gstRate);
  const total = Math.max(0, taxable + shipping + gst);

  return { subtotal, discount, shipping, gst, total };
}
