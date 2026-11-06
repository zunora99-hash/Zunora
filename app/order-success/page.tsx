import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage({ searchParams }: { searchParams: { order?: string; email?: string } }) {
  return (
    <div className="container grid min-h-[70vh] place-items-center py-10 text-center">
      <div>
        <CheckCircle2 className="mx-auto h-16 w-16 text-olive" />
        <h1 className="mt-5 font-serif text-5xl font-bold">Order received</h1>
        <p className="mt-3 text-muted-foreground">Your order {searchParams.order ?? ""} has been received.</p>
        {searchParams.email === "sent" ? (
          <p className="mt-2 text-sm text-olive">Your itemized invoice has been emailed to you.</p>
        ) : searchParams.email === "not-sent" ? (
          <p className="mt-2 text-sm text-destructive">Your order is safe, but we could not email your invoice. Please contact support; the store owner must configure email delivery.</p>
        ) : null}
        <p className="mt-2 text-sm text-muted-foreground">Dispatch is expected within 12 hours after payment is confirmed. For Cash on Delivery, dispatch is expected within 12 hours after order confirmation.</p>
        <Button className="mt-6" asChild><Link href="/account">Track order</Link></Button>
      </div>
    </div>
  );
}
