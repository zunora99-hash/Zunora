import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { sendOrderConfirmationForOrder } from "@/lib/order-notifications";
import { prisma } from "@/lib/prisma";
import { readTextBody } from "@/lib/request-body";

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
    return NextResponse.json({ error: "Invalid webhook content type." }, { status: 415 });
  }
  const bodyResult = await readTextBody(request, 256 * 1024);
  if (!bodyResult.ok) return NextResponse.json({ error: bodyResult.error }, { status: bodyResult.status });
  const rawBody = bodyResult.text;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature");
  if (!secret) return NextResponse.json({ error: "Webhook verification is not configured." }, { status: 503 });
  if (!signature || !/^[a-f\d]{64}$/i.test(signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const expectedSignature = createHmac("sha256", secret).update(rawBody).digest();
  const receivedSignature = Buffer.from(signature, "hex");
  if (receivedSignature.length !== expectedSignature.length || !timingSafeEqual(expectedSignature, receivedSignature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let body: {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          amount?: number;
          currency?: string;
          status?: string;
        };
      };
    };
  };
  try {
    body = JSON.parse(rawBody) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid webhook body." }, { status: 400 });
  }

  const payment = body.payload?.payment?.entity;
  if (!payment?.order_id || !payment.id) return NextResponse.json({ ok: true });

  const order = await prisma.order.findUnique({ where: { razorpayOrderId: payment.order_id } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  if (body.event === "payment.failed" && payment.status === "failed") {
    await prisma.order.updateMany({
      where: { id: order.id, paymentStatus: "PENDING" },
      data: { paymentStatus: "FAILED" }
    });
    return NextResponse.json({ ok: true });
  }

  if (body.event !== "payment.captured" || payment.status !== "captured") {
    return NextResponse.json({ ok: true });
  }
  if (payment.amount !== order.total * 100 || payment.currency !== "INR") {
    return NextResponse.json({ error: "Payment amount does not match the order." }, { status: 400 });
  }

  await prisma.order.updateMany({
    where: { id: order.id, paymentStatus: { in: ["PENDING", "FAILED"] } },
    data: { paymentStatus: "PAID", razorpayPaymentId: payment.id }
  });

  try {
    await sendOrderConfirmationForOrder(order.orderNumber);
  } catch (error) {
    console.error(`Order confirmation email failed for ${order.orderNumber}`, error);
    return NextResponse.json({ error: "Could not send order confirmation." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
