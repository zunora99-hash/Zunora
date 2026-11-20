import { OrderStatusList } from "@/components/admin/order-status-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 250,
    select: {
      orderNumber: true,
      email: true,
      status: true,
      paymentStatus: true,
      total: true,
      createdAt: true,
      address: { select: { latitude: true, longitude: true } },
      _count: { select: { items: true } }
    }
  });

  return <div>
    <p className="eyebrow">Fulfilment</p>
    <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">Orders</h1>
    <p className="mt-3 text-sm text-muted-foreground">Manage the latest 250 orders. Changing an order to delivered emails the customer's checkout address.</p>
    <Card className="mt-6">
      <CardHeader><CardTitle>All orders</CardTitle></CardHeader>
      <CardContent className="p-3 sm:p-6">
        <OrderStatusList orders={orders.map((order) => ({
          orderNumber: order.orderNumber,
          email: order.email,
          status: order.status,
          paymentStatus: order.paymentStatus,
          total: order.total,
          createdAt: order.createdAt.toISOString(),
          itemCount: order._count.items,
          latitude: order.address.latitude,
          longitude: order.address.longitude
        }))} />
      </CardContent>
    </Card>
  </div>;
}
