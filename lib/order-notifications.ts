import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email";

const claimDurationMs = 5 * 60 * 1000;

export async function sendOrderConfirmationForOrder(orderNumber: string): Promise<"sent" | "pending"> {
  const now = new Date();
  const staleClaim = new Date(now.getTime() - claimDurationMs);
  const claim = await prisma.order.updateMany({
    where: {
      orderNumber,
      confirmationEmailSentAt: null,
      OR: [
        { confirmationEmailClaimedAt: null },
        { confirmationEmailClaimedAt: { lt: staleClaim } }
      ]
    },
    data: { confirmationEmailClaimedAt: now }
  });

  if (!claim.count) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: { confirmationEmailSentAt: true }
    });
    if (!order) throw new Error(`Order ${orderNumber} was not found while sending its confirmation.`);
    return order.confirmationEmailSentAt ? "sent" : "pending";
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { address: true, items: true }
    });
    if (!order) throw new Error(`Order ${orderNumber} was not found while sending its confirmation.`);
    if (order.paymentMethod === "RAZORPAY" && order.paymentStatus !== "PAID") {
      throw new Error(`Cannot send a prepaid order confirmation before payment for ${orderNumber}.`);
    }

    await sendOrderConfirmation({
      to: order.email,
      customerName: order.address.name,
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      gst: order.gst,
      total: order.total,
      address: {
        name: order.address.name,
        phone: order.address.phone,
        line1: order.address.line1,
        line2: order.address.line2,
        city: order.address.city,
        state: order.address.state,
        postalCode: order.address.postalCode,
        country: order.address.country
      },
      items: order.items.map((item) => ({
        name: item.name,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price
      }))
    });

    await prisma.order.update({
      where: { orderNumber },
      data: { confirmationEmailSentAt: new Date(), confirmationEmailClaimedAt: null }
    });
    return "sent";
  } catch (error) {
    await prisma.order.updateMany({
      where: { orderNumber, confirmationEmailClaimedAt: now, confirmationEmailSentAt: null },
      data: { confirmationEmailClaimedAt: null }
    });
    throw error;
  }
}
