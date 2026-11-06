import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container grid min-h-[70vh] place-items-center text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-serif text-5xl font-bold">This page is out of stock.</h1>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">The link may have moved, but the premium almonds, cashews, pistachios, and gift boxes are still waiting.</p>
        <Button className="mt-6" asChild>
          <Link href="/shop">Go to shop</Link>
        </Button>
      </div>
    </div>
  );
}
