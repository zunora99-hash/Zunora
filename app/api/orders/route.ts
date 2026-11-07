import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { products, type CatalogProduct, type CatalogVariant } from "@/lib/catalog";
import { calculateTotals } from "@/lib/pricing";
import { getRazorpayClient } from "@/lib/razorpay";
import { sendOrderConfirmationForOrder } from "@/lib/order-notifications";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations";

function getDatabaseError(error: unknown) {
  if (!error || typeof error !== "object") return { code: undefined, message: undefined };
  const code = "code" in error && typeof error.code === "string" ? error.code : undefined;
  const message = "message" in error && typeof error.message === "string" ? error.message : undefined;
  return { code, message };
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Checkout details are missing or invalid. Please refresh and try again." }, { status: 400 });
  }
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const enrichedItems: Array<{ product: CatalogProduct; variant: CatalogVariant; quantity: number }> = [];
  for (const item of parsed.data.items) {
    const product = products.find((entry) => entry.id === item.productId);
    const variant = product?.variants.find((entry) => entry.id === item.variantId);
    if (!product || !variant) {
      return NextResponse.json({ error: "A product in your cart is no longer available. Refresh your cart and try again." }, { status: 400 });
    }
    enrichedItems.push({ product, variant, quantity: item.quantity });
  }

  const subtotalItems = enrichedItems.map((item) => ({ price: item.variant.price, quantity: item.quantity }));
  const discount = parsed.data.couponCode?.toUpperCase() === "FRESH10" ? Math.round(calculateTotals(subtotalItems).subtotal * 0.1) : 0;
  const totals = calculateTotals(subtotalItems, discount);

  const email = session?.user.email ?? parsed.data.email;
  const orderNumber = `ZN-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  let razorpayOrderId: string | null = null;
  if (parsed.data.paymentMethod === "RAZORPAY") {
    try {
      const razorpayOrder = await getRazorpayClient().orders.create({
        amount: totals.total * 100,
        currency: "INR",
        receipt: orderNumber,
        notes: { orderNumber }
      });
      razorpayOrderId = razorpayOrder.id;
    } catch (error) {
      console.error("Could not create Razorpay order", error);
      return NextResponse.json({ error: "Online payment is unavailable right now. Please try Cash on Delivery." }, { status: 503 });
    }
  }

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: {
          ...parsed.data.address,
          userId: session?.user.id
        }
      });
      return tx.order.create({
        data: {
          orderNumber,
          userId: session?.user.id,
          email,
          addressId: address.id,
          paymentMethod: parsed.data.paymentMethod,
          paymentStatus: "PENDING",
          razorpayOrderId,
          subtotal: totals.subtotal,
          discount: totals.discount,
          shipping: totals.shipping,
          gst: totals.gst,
          total: totals.total,
          couponCode: parsed.data.couponCode?.toUpperCase(),
          items: {
            create: enrichedItems.map(({ product, variant, quantity }) => ({
              productId: product.id,
              variantId: variant.id,
              name: product.name,
              variant: variant.label,
              price: variant.price,
              quantity,
              image: product.images[0]
            }))
          }
        }
      });
    });
  } catch (error) {
    const { code, message } = getDatabaseError(error);
    const safeMessage = message?.replace(/postgres(?:ql)?:\/\/[^\s"'`]+/gi, "[redacted database URL]");
    console.error(`Could not save order ${orderNumber}`, { code, message: safeMessage });
    const databaseErrors: Record<string, string> = {
      P1000: "The store database rejected its credentials. The store owner must check DATABASE_URL in Vercel.",
      P1001: "The store cannot reach its database. The store owner must check the Render database status and DATABASE_URL in Vercel.",
      P1002: "The store database connection timed out. Please try again later.",
      P1003: "The store database is missing. Please contact the store owner.",
      P1011: "The secure database connection failed. The store owner must check the SSL settings in DATABASE_URL.",
      P2003: "The store catalog is not initialized correctly. Please contact the store owner.",
      P2021: "The store database tables are missing. Please contact the store owner.",
      P2022: "The store database schema is out of date. Please contact the store owner."
    };
    return NextResponse.json({
      error: (code && databaseErrors[code]) || "We could not save your order. Please check the server logs and try again. If this keeps happening, contact support before submitting again."
    }, { status: 503 });
  }

  if (order.paymentMethod === "RAZORPAY") {
    return NextResponse.json({
      orderNumber: order.orderNumber,
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrderId,
        amount: order.total * 100,
        currency: "INR"
      }
    });
  }

  let emailSent = true;
  try {
    await sendOrderConfirmationForOrder(order.orderNumber);
  } catch (error) {
    emailSent = false;
    console.error(`Order confirmation email failed for ${order.orderNumber}`, error);
  }

  const emailStatus = emailSent ? "sent" : "not-sent";
  return NextResponse.json({
    orderNumber: order.orderNumber,
    total: order.total,
    emailSent,
    redirect: `/order-success?order=${encodeURIComponent(order.orderNumber)}&email=${emailStatus}`
  });
}
