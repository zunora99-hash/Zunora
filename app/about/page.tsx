import Image from "next/image";
import { Leaf, ShieldCheck, Sprout } from "lucide-react";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "About", description: "Learn about Zunora sourcing, freshness, and premium dry fruits quality.", path: "/about" });

const values = [
  { title: "Sourcing", icon: Sprout, copy: "Supplier checks and product-specific quality specs." },
  { title: "Purity", icon: ShieldCheck, copy: "Food-safe packing, FSSAI compliance, and clear labelling." },
  { title: "Freshness", icon: Leaf, copy: "Smaller batches and quick dispatch to protect crunch and aroma." }
];

export default function AboutPage() {
  return (
    <div>
      <section className="container grid gap-10 py-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="eyebrow">About Zunora</p>
          <h1 className="mt-3 font-serif text-5xl font-bold">Dry fruits with traceable quality and everyday warmth.</h1>
          <p className="mt-5 text-lg text-muted-foreground">Zunora is built for customers who want to enjoy quality dry fruits and snacks. We focus on careful selection, fresh packing, and clear product information.</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
          <Image src="https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=1000&q=85" alt="Dry fruits and seeds arranged for packing" fill className="object-cover" />
        </div>
      </section>
      <section className="bg-white/45 py-14">
        <div className="container grid gap-5 md:grid-cols-3">
          {values.map(({ title, icon: Icon, copy }) => (
            <div key={title} className="rounded-lg border bg-card p-6">
              <Icon className="h-7 w-7 text-olive" />
              <h2 className="mt-4 font-serif text-2xl font-semibold">{title}</h2>
              <p className="mt-2 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
