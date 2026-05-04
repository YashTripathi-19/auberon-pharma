import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyUserToken, USER_COOKIE } from "@/lib/userAuth";
import { getOrder, updateOrder, getProduct, updateProduct } from "@/lib/db";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import { orderCancelledTemplate } from "@/lib/email-templates";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE)?.value;
    const userPayload = token ? await verifyUserToken(token) : null;
    if (!userPayload) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

    const order = getOrder(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.userId !== userPayload.userId) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
    if (!["pending", "confirmed"].includes(order.status)) {
      return NextResponse.json({ error: "This order cannot be cancelled" }, { status: 400 });
    }

    // Revert stock
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const product = getProduct(item.productId);
        if (product) updateProduct(item.productId, { stock: product.stock + item.quantity });
      }
    } else {
      const product = getProduct(order.productId);
      if (product) updateProduct(order.productId, { stock: product.stock + (order.quantity || 1) });
    }

    // Attempt refund if paid
    const isPaid = order.paymentStatus === "paid" || (!order.paymentStatus && !!order.paymentId);
    let refunded = false;

    if (isPaid && order.paymentId) {
      try {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID!,
          key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });
        await razorpay.payments.refund(order.paymentId, {
          amount: order.amountPaid ?? undefined,
          notes: { reason: "Customer cancelled order" },
        });
        refunded = true;
      } catch (err) {
        console.error("[cancel] Refund failed:", err);
      }
    }

    const updates: Partial<typeof order> = { status: "rejected" };
    if (refunded) updates.paymentStatus = "refunded";
    updateOrder(id, updates);

    // Send emails
    const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
    if (GMAIL_USER && GMAIL_APP_PASSWORD) {
      const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
      const amtRs = order.amountPaid
        ? `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(order.amountPaid / 100)}`
        : "";

      if (order.customerEmail) {
        const refundAmountNum = refunded && order.amountPaid ? order.amountPaid / 100 : undefined;
        const { subject, html } = orderCancelledTemplate({
          name: order.customerName,
          orderId: order.id,
          refundAmount: refundAmountNum,
        });
        await t.sendMail({
          from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
          to: order.customerEmail,
          subject,
          html,
        }).catch(() => {});
      }

      await t.sendMail({
        from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
        to: "auberon.pharma@gmail.com",
        subject: `Order Cancelled by Customer — ${order.id}`,
        text: `Order cancelled by customer.\n\nOrder ID: ${order.id}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nEmail: ${order.customerEmail || "—"}\nRefund: ${refunded ? `Yes — ${amtRs}` : "No (not paid)"}\nPayment ID: ${order.paymentId || "—"}`,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, refunded });
  } catch (err) {
    console.error("[cancel]", err);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
