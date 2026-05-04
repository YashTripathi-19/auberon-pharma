import { NextRequest, NextResponse } from "next/server";
import { getOrder, updateOrder, getProduct, updateProduct } from "@/lib/db";
import nodemailer from "nodemailer";
import { orderStatusTemplate, feedbackRequestTemplate, appreciationEmailTemplate } from "@/lib/email-templates";
import { generatePaymentSlipHTML } from "@/lib/payment-slip";
import { paymentSlipEmailTemplate } from "@/lib/email-templates";

async function sendTrackingEmail(order: { id: string; customerName: string; customerEmail: string; items?: { productName: string; quantity: number }[]; productName?: string; quantity?: number }, newStatus: string) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !order.customerEmail) return;

  const statusMessages: Record<string, string> = {
    confirmed: "Your order has been confirmed and is being prepared for dispatch.",
    dispatched: "Your order is on its way! Expected delivery within 3-5 business days. Track your order by contacting us at auberon.pharma@gmail.com.",
    delivered: "Your order has been delivered. We hope you are satisfied with your purchase. For any issues please contact auberon.pharma@gmail.com.",
  };

  if (!statusMessages[newStatus]) return;

  const { subject, html } = orderStatusTemplate({
    name: order.customerName,
    orderId: order.id,
    status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
    message: statusMessages[newStatus],
  });

  const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
  await t.sendMail({
    from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
    to: order.customerEmail,
    subject,
    html,
  }).catch((err) => console.error("[tracking-email]", err));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const order = getOrder(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["pending", "confirmed", "dispatched", "delivered", "rejected", "expired"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: pending, confirmed, dispatched, delivered, rejected, or expired" },
        { status: 400 }
      );
    }

    const order = getOrder(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Revert stock when rejecting or expiring an order that was previously active
    const revertStatuses = ["rejected", "expired"];
    const activeStatuses = ["pending", "confirmed", "dispatched"];
    if (revertStatuses.includes(status) && activeStatuses.includes(order.status)) {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          const product = getProduct(item.productId);
          if (product) updateProduct(item.productId, { stock: product.stock + item.quantity });
        }
      } else {
        const product = getProduct(order.productId);
        if (product) updateProduct(order.productId, { stock: product.stock + (order.quantity || 1) });
      }
    }

    const updated = updateOrder(id, { status });
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Send tracking email for key status transitions (fire-and-forget)
    if (["confirmed", "dispatched", "delivered"].includes(status) && order.customerEmail) {
      sendTrackingEmail({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items,
        productName: order.productName,
        quantity: order.quantity,
      }, status).catch(() => {});
    }

    // Send feedback request email + appreciation email when order is delivered
    if (status === "delivered" && order.customerEmail) {
      ;(async () => {
        try {
          const { GMAIL_USER, GMAIL_APP_PASSWORD, NEXT_PUBLIC_BASE_URL } = process.env;
          if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return;

          const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });

          // Send feedback request email
          const feedbackUrl = `${NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/feedback/${order.id}`;
          const { subject, html } = feedbackRequestTemplate({
            name: order.customerName,
            orderId: order.id,
            feedbackUrl,
          });

          await t.sendMail({
            from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
            to: order.customerEmail,
            subject,
            html,
          });

          // Send appreciation email
          const items = order.items?.length
            ? order.items.map(i => ({ name: i.productName }))
            : [{ name: order.productName || "Your order" }];

          const { subject: appSubject, html: appHtml } = appreciationEmailTemplate({
            name: order.customerName,
            orderId: order.id,
            items,
          });

          await t.sendMail({
            from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
            to: order.customerEmail,
            subject: appSubject,
            html: appHtml,
          });
        } catch (err) {
          console.error("[delivery-emails] Failed:", err);
        }
      })();
    }

    // Send payment reminder slip when admin confirms the order
    if (status === "confirmed" && order.customerEmail) {
      ;(async () => {
        try {
          const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
          if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return;

          const items = order.items?.length
            ? order.items.map(i => ({ name: i.productName, qty: i.quantity, price: i.unitPrice }))
            : [{ name: order.productName || "Order", qty: order.quantity || 1, price: order.totalAmount || 0 }];

          const total = order.totalAmount || items.reduce((s, i) => s + i.price * i.qty, 0);

          const slipHtml = await generatePaymentSlipHTML({
            orderId: order.id,
            customerName: order.customerName,
            items,
            total,
          });

          const { subject, html } = paymentSlipEmailTemplate({
            name: order.customerName,
            orderId: order.id,
            slipHtml,
          });

          const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
          await t.sendMail({
            from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
            to: order.customerEmail,
            subject: `Payment Reminder — ${subject}`,
            html,
          });
        } catch (err) {
          console.error("[payment-slip-reminder] Failed:", err);
        }
      })();
    }

    return NextResponse.json({ success: true, order: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
