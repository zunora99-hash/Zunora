import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Shipping and Returns", description: "Shipping, cancellation, and return policy for Zunora orders.", path: "/shipping-returns" });

export default function ShippingReturnsPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="font-serif text-5xl font-bold">Shipping and Return Policy</h1>
      <div className="mt-6 grid gap-4 text-muted-foreground">
        <p>Orders usually ship within 1-2 business days. Delivery timelines depend on destination pincode and courier serviceability.</p>
        <p>Food products are returnable only if damaged, incorrect, expired, or tampered on arrival. Please contact support within 48 hours with photos.</p>
        <p>Refunds are processed to the original payment method after inspection and approval.</p>
      </div>
    </div>
  );
}
