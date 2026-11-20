import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { sendDeliveryStatusEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";

const orderStatuses = ["PENDING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export async function PATCH(request: Request, { params }: { params: { orderNumber: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await readJsonBody(request, 1024);
  if (!body.ok || !body.value || typeof body.value !== "object" || !("status" in body.value)) {
    return NextResponse.json({ error: "Choose a valid order status." }, { status: 400 });
  }
  const status = (body.value as { status?: unknown }).status;
  if (typeof status !== "string" || !orderStatuses.includes(status as (typeof orderStatuses)[number])) {
    return NextResponse.json({ error: "Choose a valid order status." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    select: { id: true, status: true, email: true, address: { select: { name: true } } }
  });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const changed = order.status !== status && Boolean((await prisma.order.updateMany({
    where: { id: order.id, status: { not: status as (typeof orderStatuses)[number] } },
    data: { status: status as (typeof orderStatuses)[number] }
  })).count);

  let emailSent = false;
  if (status === "DELIVERED" && changed) {
    try {
      await sendDeliveryStatusEmail({ to: order.email, customerName: order.address.name, orderNumber: params.orderNumber });
      emailSent = true;
    } catch (error) {
      console.error(`Delivery email failed for ${params.orderNumber}`, error);
      return NextResponse.json({ status, emailSent: false, error: "Status saved, but the delivery email could not be sent. Check SMTP settings." }, { status: 502 });
    }
  }

  return NextResponse.json({ status, emailSent });
}
