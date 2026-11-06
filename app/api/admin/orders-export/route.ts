import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true,
      email: true,
      status: true,
      paymentMethod: true,
      paymentStatus: true,
      subtotal: true,
      discount: true,
      shipping: true,
      gst: true,
      total: true,
      createdAt: true
    }
  });

  const csvCell = (value: string | number | Date) => {
    const text = value instanceof Date ? value.toISOString() : String(value);
    const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText.replace(/"/g, '""')}"`;
  };
  const rows = [
    ["Order", "Customer email", "Order status", "Payment method", "Payment status", "Subtotal", "Discount", "Shipping", "GST", "Total", "Created at"],
    ...orders.map((order) => [
      order.orderNumber,
      order.email,
      order.status,
      order.paymentMethod,
      order.paymentStatus,
      order.subtotal,
      order.discount,
      order.shipping,
      order.gst,
      order.total,
      order.createdAt
    ])
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="zunora-orders.csv"',
      "Cache-Control": "private, no-store"
    }
  });
}
