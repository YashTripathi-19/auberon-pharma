import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getOrder, updateOrder } from "@/lib/db";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import { orderCancelledTemplate } from "@/lib/email-templates";

export async function POST(request: NextRequest) {
  try {
    // Admin auth
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token")?.value;
    if (!adminToken || !(await verifyToken(adminToken))) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { orderId, reason } = await request.json();
    if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });

    const order = getOrder(orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    // Treat as paid if paymentId exists (handles legacy orders without paymentStatus field)
    const isPaid = order.paymentStatus === "paid" || (!order.paymentStatus && !!order.paymentId);
    if (!isPaid) return NextResponse.json({ error: "Order is not paid" }, { status: 400 });
    if (!order.paymentId) return NextResponse.json({ error: "No payment ID on order" }, { status: 400 });

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    await razorpay.payments.refund(order.paymentId, {
      amount: order.amountPaid ?? undefined,
      notes: { reason: reason || "Admin initiated refund" },
    });

    const updated = updateOrder(orderId, { paymentStatus: "refunded" });

    // Send refund email to customer
    const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
    if (GMAIL_USER && GMAIL_APP_PASSWORD) {
      const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
      const amtRs = order.amountPaid
        ? `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(order.amountPaid / 100)}`
        : "the paid amount";

      if (order.customerEmail) {
        const refundAmountNum = order.amountPaid ? order.amountPaid / 100 : undefined;
        const { subject, html } = orderCancelledTemplate({
          name: order.customerName,
          orderId: order.id,
          refundAmount: refundAmountNum,
          reason: reason || undefined,
        });
        await t.sendMail({
          from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
          to: order.customerEmail,
          subject,
          html,
        }).catch(() => {});
      }

      // Admin notification
      const refundAmtRs = order.amountPaid
        ? `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(order.amountPaid / 100)}`
        : "the paid amount";
      await t.sendMail({
        from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
        to: "auberon.pharma@gmail.com",
        subject: `Refund Processed — Order ${order.id}`,
        text: `Refund processed.\n\nOrder ID: ${order.id}\nCustomer: ${order.customerName}\nEmail: ${order.customerEmail || "—"}\nPhone: ${order.customerPhone}\nRefund Amount: ${refundAmtRs}\nReason: ${reason || "Not provided"}\nPayment ID: ${order.paymentId}`,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    console.error("[refund]", err);
    return NextResponse.json({ error: "Refund failed" }, { status: 500 });
  }
}
