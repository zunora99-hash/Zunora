import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Terms", description: "Zunora terms and conditions.", path: "/terms" });

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="font-serif text-5xl font-bold">Terms and Conditions</h1>
      <div className="mt-6 grid gap-4 text-muted-foreground">
        <p>Orders are accepted subject to stock availability, address serviceability, payment confirmation, and fraud checks.</p>
        <p>Product images are representative. Natural dry fruits can vary in size, color, and shape across batches.</p>
        <p>Prices, coupons, shipping fees, and GST are recalculated on the server at checkout.</p>
      </div>
    </div>
  );
}
