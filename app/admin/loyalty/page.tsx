import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loyaltyQrCodeId } from "@/lib/loyalty";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

type LoyaltyCustomerRow = {
  id: string;
  name: string;
  phone: string;
  rewardCode: string | null;
  qrCodeId: string;
  createdAt: Date;
  rewardRedeemedAt: Date | null;
  rewardOrderNumber: string | null;
};

export default async function AdminLoyaltyPage() {
  const [customers, totalRows, redeemedRows] = await Promise.all([
    prisma.$queryRaw<LoyaltyCustomerRow[]>`
      SELECT "id", "name", "phone", "rewardCode", "qrCodeId", "createdAt", "rewardRedeemedAt", "rewardOrderNumber"
      FROM "LoyaltyCustomer"
      ORDER BY "createdAt" DESC
      LIMIT 500
    `,
    prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int AS "count" FROM "LoyaltyCustomer"`,
    prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int AS "count" FROM "LoyaltyCustomer" WHERE "rewardRedeemedAt" IS NOT NULL`
  ]);
  const rewardUrl = `${siteConfig.url}/newuser`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&format=svg&data=${encodeURIComponent(rewardUrl)}`;
  const registeredCount = totalRows[0]?.count ?? 0;
  const redeemedCount = redeemedRows[0]?.count ?? 0;

  return (
    <div>
      <p className="eyebrow">Admin · Customer rewards</p>
      <h1 className="mt-2 font-serif text-4xl font-bold">Loyalty rewards</h1>
      <p className="mt-2 text-muted-foreground">Customers scan the product QR, register, and scratch to reveal their own 5% coupon code.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader><CardTitle>Product QR code</CardTitle></CardHeader>
          <CardContent>
            <img src={qrImageUrl} alt="QR code for Zunora's next visit reward registration" width="240" height="240" className="mx-auto h-60 w-60 rounded-md border bg-white p-2" />
            <a href={qrImageUrl} target="_blank" rel="noreferrer" className="mt-4 block text-center text-sm font-semibold text-primary underline">Open printable QR</a>
            <p className="mt-3 break-all text-center text-xs text-muted-foreground">{rewardUrl}</p>
            <p className="mt-2 text-center text-xs text-muted-foreground">QR ID: {loyaltyQrCodeId}</p>
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Registered customers</p><p className="mt-2 font-serif text-3xl font-bold">{registeredCount}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Rewards used</p><p className="mt-2 font-serif text-3xl font-bold">{redeemedCount}</p></CardContent></Card>
          <Card className="sm:col-span-2">
            <CardHeader><CardTitle>How the reward works</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ol className="list-inside list-decimal space-y-1">
                <li>Customers scan the QR, enter their name and mobile number, and scratch to reveal a unique code.</li>
                <li>At checkout they enter the code. It applies 5% once and cannot be combined with another coupon.</li>
                <li>This page records each customer ID, code, registration date, and redeemed order.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Registered customers</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-muted-foreground"><tr><th className="py-3">Customer ID</th><th>Name</th><th>Mobile</th><th>Reward code</th><th>QR ID</th><th>Registered</th><th>Reward</th><th>Order</th></tr></thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t">
                  <td className="py-3 font-mono text-xs">{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td className="font-mono text-xs">{customer.rewardCode ?? "—"}</td>
                  <td>{customer.qrCodeId}</td>
                  <td>{customer.createdAt.toLocaleDateString("en-IN")}</td>
                  <td>{customer.rewardRedeemedAt ? `Used ${customer.rewardRedeemedAt.toLocaleDateString("en-IN")}` : "Available"}</td>
                  <td>{customer.rewardOrderNumber ?? "—"}</td>
                </tr>
              ))}
              {!customers.length ? <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No reward registrations yet.</td></tr> : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
