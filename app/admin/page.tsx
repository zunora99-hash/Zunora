import { Download, PackageX, ShoppingBag, Users, Wallet } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") redirect("/login");

  const now = new Date();
  const firstMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

  const [orderValue, paidSales, orderCount, customerCountRows, pendingPayments, recentOrders, lowStock, monthlyRows] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true }
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", status: { not: "CANCELLED" } },
      _sum: { total: true }
    }),
    prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(DISTINCT LOWER("email"))::int AS "count"
      FROM "Order"
      WHERE "status" != 'CANCELLED'
    `,
    prisma.order.count({
      where: {
        status: { not: "CANCELLED" },
        paymentStatus: "PENDING"
      }
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        orderNumber: true,
        email: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
        _count: { select: { items: true } }
      }
    }),
    prisma.variant.findMany({
      where: { stock: { lt: 12 }, product: { active: true } },
      orderBy: { stock: "asc" },
      take: 6,
      select: { label: true, stock: true, product: { select: { name: true } } }
    }),
    prisma.$queryRaw<Array<{ month: Date; revenue: number }>>`
      SELECT date_trunc('month', "createdAt") AS "month", SUM("total")::float8 AS "revenue"
      FROM "Order"
      WHERE "status" != 'CANCELLED' AND "createdAt" >= ${firstMonth}
      GROUP BY date_trunc('month', "createdAt")
      ORDER BY "month" ASC
    `
  ]);

  const revenueByMonth = new Map(monthlyRows.map(({ month, revenue }) => [month.toISOString().slice(0, 7), revenue]));
  const revenueTrend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + index, 1));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    return {
      month: date.toLocaleString("en-IN", { month: "short", timeZone: "UTC" }),
      revenue: revenueByMonth.get(key) ?? 0
    };
  });

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 font-serif text-5xl font-bold">Dashboard</h1>
        </div>
        <Button variant="outline" asChild>
          <a href="/api/admin/orders-export" download>
            <Download className="h-4 w-4" /> Export orders
          </a>
        </Button>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Order value", value: formatPrice(orderValue._sum.total ?? 0), icon: ShoppingBag },
          { label: "Collected", value: formatPrice(paidSales._sum.total ?? 0), icon: Wallet },
          { label: "Orders", value: String(orderCount), icon: ShoppingBag },
          { label: "Customers", value: (customerCountRows[0]?.count ?? 0).toLocaleString("en-IN"), icon: Users },
          { label: "Pending payments", value: String(pendingPayments), icon: Wallet }
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon className="h-4 w-4 text-olive" />
              </div>
              <p className="mt-2 font-serif text-3xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader><CardTitle>Order value · last 6 months</CardTitle></CardHeader>
          <CardContent><RevenueChart data={revenueTrend} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Low stock alerts</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {lowStock.length ? lowStock.map((variant) => (
              <div key={`${variant.product.name}-${variant.label}`} className="flex items-center gap-3 rounded-md border p-3 text-sm">
                <PackageX className="h-4 w-4 shrink-0 text-saffron" />
                <span>{variant.product.name} {variant.label} <span className="text-muted-foreground">· {variant.stock} left</span></span>
              </div>
            )) : <p className="text-sm text-muted-foreground">No low-stock products.</p>}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle>Recent orders</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr><th className="py-3">Order</th><th>Customer email</th><th>Order</th><th>Payment</th><th>Items</th><th>Total</th><th>Date</th></tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.orderNumber} className="border-t">
                  <td className="py-3 font-semibold">{order.orderNumber}</td>
                  <td>{order.email}</td>
                  <td>{order.status}</td>
                  <td>{order.paymentStatus}</td>
                  <td>{order._count.items}</td>
                  <td>{formatPrice(order.total)}</td>
                  <td>{order.createdAt.toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
              {!recentOrders.length ? <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No orders yet. Orders will appear here after checkout.</td></tr> : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
