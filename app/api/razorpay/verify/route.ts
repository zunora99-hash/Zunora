import { createHmac, timingSafeEqual } from "crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/auth";
import { sendOrderConfirmationForOrder } from "@/lib/order-notifications";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient } from "@/lib/razorpay";

const verificationSchema = z.object({
  orderNumber: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().regex(/^[a-f\d]{64}$/i)
});

export async function POST(request: Request) {
  const parsed = verificationSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payment details." }, { status: 400 });

  const { orderNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order || order.paymentMethod !== "RAZORPAY" || order.razorpayOrderId !== razorpay_order_id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  if (order.userId && order.userId !== session?.user.id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Payment verification is not configured." }, { status: 503 });
  }
  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest();
  const receivedSignature = Buffer.from(razorpay_signature, "hex");
  if (receivedSignature.length !== expectedSignature.length || !timingSafeEqual(expectedSignature, receivedSignature)) {
    return NextResponse.json({ error: "Payment signature is invalid." }, { status: 400 });
  }

  const razorpayPayment = await getRazorpayClient().payments.fetch(razorpay_payment_id);
  if (
    razorpayPayment.order_id !== razorpay_order_id ||
    razorpayPayment.amount !== order.total * 100 ||
    razorpayPayment.currency !== "INR" ||
    razorpayPayment.status !== "captured"
  ) {
    return NextResponse.json({ error: "Payment has not been captured for this order." }, { status: 409 });
  }

  await prisma.order.updateMany({
    where: {
      id: order.id,
      paymentStatus: { in: ["PENDING", "FAILED"] }
    },
    data: { paymentStatus: "PAID", razorpayPaymentId: razorpay_payment_id }
  });

  const confirmedOrder = await prisma.order.findUnique({ where: { id: order.id } });
  if (confirmedOrder?.paymentStatus !== "PAID" || confirmedOrder.razorpayPaymentId !== razorpay_payment_id) {
    return NextResponse.json({ error: "We could not confirm the payment. Please contact support." }, { status: 409 });
  }

  let emailStatus = "pending";
  try {
    emailStatus = await sendOrderConfirmationForOrder(orderNumber);
  } catch (error) {
    console.error(`Order confirmation email failed for ${orderNumber}`, error);
    emailStatus = "not-sent";
  }

  return NextResponse.json({
    orderNumber,
    emailSent: emailStatus === "sent",
    redirect: `/order-success?order=${encodeURIComponent(orderNumber)}&email=${emailStatus}`
  });
}
