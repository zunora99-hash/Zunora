import { CheckoutForm } from "@/components/checkout/checkout-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Checkout", description: "Secure checkout for Zunora dry fruits orders.", path: "/checkout", noIndex: true });

export default function CheckoutPage() {
  return (
    <div className="container py-10">
      <p className="eyebrow">Secure checkout</p>
      <h1 className="mt-2 font-serif text-5xl font-bold">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
