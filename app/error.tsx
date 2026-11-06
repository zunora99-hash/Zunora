"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-3 font-serif text-4xl font-bold">We could not load this basket of goodness.</h1>
        <Button className="mt-6" onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
