import nodemailer from "nodemailer";
import { siteConfig } from "@/config/site";

type OrderConfirmationInput = {
  to: string;
  customerName: string;
  orderNumber: string;
  paymentMethod: "COD" | "RAZORPAY";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: Date;
  subtotal: number;
  discount: number;
  shipping: number;
  gst: number;
  total: number;
  address: {
    name: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{ name: string; variant: string; quantity: number; price: number }>;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character] ?? character);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: siteConfig.currency,
    maximumFractionDigits: 0
  }).format(value);
}

export async function sendOrderConfirmation(input: OrderConfirmationInput) {
  const itemsText = input.items
    .map((item) => `${item.name} (${item.variant}) x ${item.quantity} - ${formatCurrency(item.price * item.quantity)}`)
    .join("\n");
  const itemRows = input.items.map((item) => `
    <tr>
      <td style="padding:14px 10px;border-bottom:1px solid #eee8dd">
        <strong style="display:block;color:#34251c">${escapeHtml(item.name)}</strong>
        <span style="color:#786d63;font-size:13px">${escapeHtml(item.variant)}</span>
      </td>
      <td style="padding:14px 10px;border-bottom:1px solid #eee8dd;text-align:center;color:#51443a">${item.quantity}</td>
      <td style="padding:14px 10px;border-bottom:1px solid #eee8dd;text-align:right;color:#51443a;white-space:nowrap">${formatCurrency(item.price)}</td>
      <td style="padding:14px 10px;border-bottom:1px solid #eee8dd;text-align:right;color:#34251c;font-weight:700;white-space:nowrap">${formatCurrency(item.price * item.quantity)}</td>
    </tr>`).join("");
  const addressLines = [
    input.address.name,
    input.address.line1,
    input.address.line2,
    `${input.address.city}, ${input.address.state} ${input.address.postalCode}`,
    input.address.country,
    `Phone: ${input.address.phone}`
  ].filter((line): line is string => Boolean(line)).map((line) => `<span style="display:block">${escapeHtml(line)}</span>`).join("");
  const dispatchMessage = input.paymentMethod === "COD"
    ? "Your order will be dispatched within 12 hours after it is confirmed."
    : "Your order will be dispatched within 12 hours after your payment is confirmed.";
  const paymentLabel = input.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay";
  const paymentStatus = {
    PENDING: input.paymentMethod === "COD" ? "Due on delivery" : "Awaiting payment",
    PAID: "Paid",
    FAILED: "Payment failed",
    REFUNDED: "Refunded"
  }[input.paymentStatus];
  const issuedDate = input.createdAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });
  const greetingName = escapeHtml(input.customerName);
  const escapedOrderNumber = escapeHtml(input.orderNumber);
  const totalsRow = (label: string, value: number, bold = false) => `
    <tr>
      <td style="padding:6px 0;color:${bold ? "#34251c" : "#786d63"};${bold ? "font-weight:700;font-size:16px" : ""}">${label}</td>
      <td style="padding:6px 0;text-align:right;color:#34251c;white-space:nowrap;${bold ? "font-weight:700;font-size:18px" : ""}">${formatCurrency(value)}</td>
    </tr>`;
  const html = `
  <!doctype html>
  <html lang="en">
    <body style="margin:0;padding:24px 12px;background:#f6f3ed;font-family:Arial,Helvetica,sans-serif;color:#34251c">
      <table role="presentation" style="width:100%;max-width:680px;margin:0 auto;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden">
        <tr><td style="padding:28px 32px;background:#34251c;color:#fff">
          <div style="font-family:Georgia,serif;font-size:28px;font-weight:700">${escapeHtml(siteConfig.name)}</div>
          <div style="margin-top:5px;color:#e8d5b9;font-size:13px">${escapeHtml(siteConfig.tagline)}</div>
        </td></tr>
        <tr><td style="padding:30px 32px 18px">
          <div style="color:#71804c;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase">Order invoice</div>
          <h1 style="margin:10px 0 8px;font-family:Georgia,serif;font-size:27px">Thank you, ${greetingName}!</h1>
          <p style="margin:0;color:#786d63;line-height:1.6">Your order is confirmed. Here is your itemized order receipt.</p>
        </td></tr>
        <tr><td style="padding:12px 32px 22px">
          <table role="presentation" style="width:100%;border-collapse:collapse;background:#fbf8f2;border-radius:8px">
            <tr>
              <td style="padding:14px 16px"><span style="display:block;color:#786d63;font-size:12px">ORDER NUMBER</span><strong style="display:block;margin-top:4px">${escapedOrderNumber}</strong></td>
              <td style="padding:14px 16px;text-align:right"><span style="display:block;color:#786d63;font-size:12px">ORDER DATE</span><strong style="display:block;margin-top:4px">${issuedDate}</strong></td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px">
          <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
            <thead><tr style="color:#786d63;font-size:11px;letter-spacing:.7px;text-align:left">
              <th style="padding:10px;text-transform:uppercase">Product</th><th style="padding:10px;text-align:center;text-transform:uppercase">Qty</th><th style="padding:10px;text-align:right;text-transform:uppercase">Price</th><th style="padding:10px;text-align:right;text-transform:uppercase">Amount</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
        </td></tr>
        <tr><td style="padding:18px 32px 24px">
          <table role="presentation" style="width:100%;max-width:320px;margin-left:auto;border-collapse:collapse;font-size:14px">
            ${totalsRow("Subtotal", input.subtotal)}
            ${totalsRow("Discount", -input.discount)}
            ${totalsRow("Shipping", input.shipping)}
            ${totalsRow("GST", input.gst)}
            <tr><td colspan="2" style="padding:8px 0"><div style="border-top:1px solid #ded5c9"></div></td></tr>
            ${totalsRow("Total", input.total, true)}
          </table>
        </td></tr>
        <tr><td style="padding:20px 32px;background:#fbf8f2">
          <table role="presentation" style="width:100%;border-collapse:collapse">
            <tr>
              <td style="width:55%;vertical-align:top;padding-right:14px">
                <strong style="display:block;margin-bottom:8px">Delivering to</strong>
                <div style="color:#65584e;font-size:13px;line-height:1.7">${addressLines}</div>
              </td>
              <td style="vertical-align:top">
                <strong style="display:block;margin-bottom:8px">Payment</strong>
                <div style="color:#65584e;font-size:13px;line-height:1.7">${paymentLabel}<br>${paymentStatus}</div>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:22px 32px 28px">
          <p style="margin:0;color:#51443a;font-size:14px;line-height:1.7">${dispatchMessage}</p>
          <p style="margin:16px 0 0;color:#786d63;font-size:12px;line-height:1.6">This email is your order receipt. For help with your order, please contact ${escapeHtml(siteConfig.name)} support.</p>
        </td></tr>
      </table>
    </body>
  </html>`;
  const text = [
    `${siteConfig.name} — Order invoice`,
    `Order: ${input.orderNumber}`,
    `Date: ${issuedDate}`,
    "",
    `Hi ${input.customerName}, thank you for your order.`,
    "",
    "Items:",
    itemsText,
    "",
    `Subtotal: ${formatCurrency(input.subtotal)}`,
    `Discount: ${formatCurrency(-input.discount)}`,
    `Shipping: ${formatCurrency(input.shipping)}`,
    `GST: ${formatCurrency(input.gst)}`,
    `Total: ${formatCurrency(input.total)}`,
    `Payment: ${paymentLabel} — ${paymentStatus}`,
    "",
    "Delivering to:",
    input.address.name,
    input.address.line1,
    input.address.line2 ?? "",
    `${input.address.city}, ${input.address.state} ${input.address.postalCode}`,
    input.address.country,
    `Phone: ${input.address.phone}`,
    "",
    dispatchMessage
  ].join("\n");

  const emailJsServiceId = process.env.EMAILJS_SERVICE_ID?.trim();
  const emailJsTemplateId = process.env.EMAILJS_TEMPLATE_ID?.trim();
  const emailJsPublicKey = process.env.EMAILJS_PUBLIC_KEY?.trim();
  const emailJsPrivateKey = process.env.EMAILJS_PRIVATE_KEY?.trim();
  const emailJsConfigured = Boolean(emailJsServiceId || emailJsTemplateId || emailJsPublicKey || emailJsPrivateKey);
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const smtpFrom = process.env.SMTP_FROM?.trim();
  const normalizedSmtpPass = smtpHost?.toLowerCase() === "smtp.gmail.com"
    ? smtpPass?.replace(/\s/g, "")
    : smtpPass;
  const missingSmtpSettings = [
    !smtpHost && "SMTP_HOST",
    !smtpUser && "SMTP_USER",
    !smtpPass && "SMTP_PASS",
    !smtpFrom && "SMTP_FROM"
  ].filter((setting): setting is string => Boolean(setting));
  const smtpConfigured = missingSmtpSettings.length === 0;
  let emailJsFailure: string | undefined;

  if (emailJsConfigured) {
    const missingEmailJsSettings = [
      !emailJsServiceId && "EMAILJS_SERVICE_ID",
      !emailJsTemplateId && "EMAILJS_TEMPLATE_ID",
      !emailJsPublicKey && "EMAILJS_PUBLIC_KEY"
    ].filter((setting): setting is string => Boolean(setting));
    if (missingEmailJsSettings.length > 0) {
      emailJsFailure = `EmailJS is partially configured; missing ${missingEmailJsSettings.join(", ")}.`;
    } else {
      try {
        const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(15_000),
          body: JSON.stringify({
            service_id: emailJsServiceId,
            template_id: emailJsTemplateId,
            user_id: emailJsPublicKey,
            ...(emailJsPrivateKey ? { accessToken: emailJsPrivateKey } : {}),
            template_params: {
              to_email: input.to,
              to_name: input.customerName,
              email_subject: `${siteConfig.name} invoice for order ${input.orderNumber}`,
              order_number: input.orderNumber,
              invoice_html: html,
              invoice_text: text
            }
          })
        });

        if (!response.ok) {
          const errorDetails = (await response.text()).slice(0, 500);
          throw new Error(`EmailJS rejected the invoice email (${response.status}): ${errorDetails}`);
        }
        return;
      } catch (error) {
        emailJsFailure = error instanceof Error ? error.message : String(error);
      }
    }
  }

  if (!smtpConfigured) {
    if (emailJsFailure) {
      throw new Error(`${emailJsFailure} SMTP is not configured; add ${missingSmtpSettings.join(", ")} to .env to enable the fallback.`);
    }
    if (!emailJsConfigured) {
      throw new Error(`Order invoice email is not configured. Add EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY to .env (recommended), or configure ${missingSmtpSettings.join(", ")} for SMTP, then restart the app.`);
    }
    throw new Error(emailJsFailure ?? "EmailJS could not send the invoice and SMTP is not configured.");
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number.");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port,
    secure: port === 465,
    auth: {
      user: smtpUser,
      pass: normalizedSmtpPass
    }
  });

  try {
    await transporter.sendMail({
      from: `${siteConfig.name} <${smtpFrom}>`,
      to: input.to,
      subject: `${siteConfig.name} invoice for order ${input.orderNumber}`,
      text,
      html
    });
  } catch (error) {
    const smtpFailure = error instanceof Error ? error.message : String(error);
    if (emailJsFailure) {
      throw new Error(`Email delivery failed through EmailJS (${emailJsFailure}) and SMTP (${smtpFailure}).`);
    }
    throw error;
  }
}
