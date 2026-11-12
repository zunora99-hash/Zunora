import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "My account", description: "Manage your Zunora account and orders.", path: "/account", noIndex: true });

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="container py-10">
      <p className="eyebrow">Account</p>
      <h1 className="mt-2 font-serif text-5xl font-bold">Hi {session?.user.name ?? "there"}</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{session?.user.email}</p>
            <p className="mt-2">Role: {session?.user.role}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Saved addresses</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Add addresses during checkout and reuse them for faster orders.</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Wishlist</CardTitle></CardHeader>
          <CardContent><Button variant="outline" asChild><Link href="/shop">Browse products</Link></Button></CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle>Order history</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">Orders placed through checkout will appear here when connected to your production database.</CardContent>
      </Card>
    </div>
  );
}
