import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { verifyUserToken, USER_COOKIE } from "@/lib/userAuth";
import { getProduct, updateProduct, saveOrder, incrementCouponUsage } from "@/lib/db";
import { generateId } from "@/lib/utils";
import nodemailer from "nodemailer";
import { orderConfirmationTemplate } from "@/lib/email-templates";
import { OrderItem } from "@/types/order";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

async function sendOrderEmails(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  amountPaid: number;
  paymentId: string;
}) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return;
  const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });

  if (order.customerEmail) {
    const { subject, html } = orderConfirmationTemplate({
      name: order.customerName,
      orderId: order.id,
      items: order.items.map(i => ({ name: i.productName, qty: i.quantity, price: i.totalPrice })),
      total: order.amountPaid / 100,
      address: order.deliveryAddress || "",
    });
    await t.sendMail({
      from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
      to: order.customerEmail,
      subject,
      html,
    }).catch(() => {});
  }

  // Admin notification — plain text summary
  const fmtRs = (n: number) => `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)}`;
  const itemsText = order.items.map((i) => `  ${i.productName} × ${i.quantity} — ${fmtRs(i.totalPrice)}`).join("\n");
  await t.sendMail({
    from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
    to: "auberon.pharma@gmail.com",
    subject: `New Paid Order — ${order.items.length} item(s) — ${fmtRs(order.amountPaid / 100)}`,
    text: `New paid order received.\n\nOrder ID: ${order.id}\nCustomer: ${order.customerName}\nItems:\n${itemsText}\n\nTotal: ${fmtRs(order.amountPaid / 100)}\nPayment ID: ${order.paymentId}`,
  }).catch(() => {});
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE)?.value;
    const userPayload = token ? await verifyUserToken(token) : null;
    if (!userPayload) return NextResponse.json({ message: "Please sign in" }, { status: 401 });

    const body = await request.json();
    const {
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
      items, customerDetails, amountPaid, couponCode, discountAmount, roleDiscountPercentage,
      sgstAmount, cgstAmount, handlingCharge,
    } = body as {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      items: CartItem[];
      customerDetails: { name: string; phone: string; email: string; address: string; notes: string };
      amountPaid: number;
      couponCode?: string | null;
      discountAmount?: number | null;
      roleDiscountPercentage?: number | null;
      sgstAmount?: number | null;
      cgstAmount?: number | null;
      handlingCharge?: number | null;
    };

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
    }

    // Build order items and deduct stock
    const orderItems: OrderItem[] = [];
    for (const item of items) {
      const product = getProduct(item.productId);
      if (product && product.stock >= item.quantity) {
        updateProduct(item.productId, { stock: product.stock - item.quantity });
      }
      orderItems.push({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
      });
    }

    const totalAmount = orderItems.reduce((s, i) => s + i.totalPrice, 0);
    // Legacy flat fields from first item (for backward compat with any code still reading them)
    const firstItem = orderItems[0];

    const order = {
      id: `ORD-${generateId()}`,
      items: orderItems,
      totalAmount,
      // Legacy flat fields
      productId: firstItem.productId,
      productName: orderItems.length === 1 ? firstItem.productName : `${orderItems.length} items`,
      quantity: orderItems.reduce((s, i) => s + i.quantity, 0),
      // Customer
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerEmail: customerDetails.email || "",
      deliveryAddress: customerDetails.address,
      notes: customerDetails.notes || "",
      status: "confirmed" as const,
      userId: userPayload.userId,
      createdAt: new Date().toISOString(),
      // Payment
      paymentStatus: "paid" as const,
      paymentId: razorpayPaymentId,
      razorpayOrderId,
      amountPaid: Number(amountPaid),
      paymentMethod: null,
      // Discounts
      discountAmount: discountAmount || null,
      couponCode: couponCode || null,
      roleDiscountPercentage: roleDiscountPercentage || null,
      // Tax
      sgstAmount: sgstAmount || null,
      cgstAmount: cgstAmount || null,
      handlingCharge: handlingCharge || null,
    };

    saveOrder(order);

    // Increment coupon usage
    if (couponCode) {
      try { incrementCouponUsage(couponCode); } catch { /* non-fatal */ }
    }

    sendOrderEmails({
      id: order.id,
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      deliveryAddress: customerDetails.address,
      items: orderItems,
      totalAmount,
      amountPaid: Number(amountPaid),
      paymentId: razorpayPaymentId,
    }).catch(() => {});

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (err) {
    console.error("[verify-payment]", err);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
