import { NextRequest, NextResponse } from "next/server";
import { getOrders, saveOrder, getProduct, updateProduct } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { verifyUserToken, USER_COOKIE } from "@/lib/userAuth";
import nodemailer from "nodemailer";
import { generatePaymentSlipHTML } from "@/lib/payment-slip";
import { paymentSlipEmailTemplate } from "@/lib/email-templates";
import { whatsappOrderConfirmed } from "@/lib/whatsapp";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const orders = getOrders();
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth guard — must be a signed-in user
    const token = request.cookies.get(USER_COOKIE)?.value;
    const payload = token ? await verifyUserToken(token) : null;
    if (!payload) {
      return NextResponse.json({ message: "Please sign in to place an order" }, { status: 401 });
    }

    const body = await request.json();

    const { productId, productName, customerName, customerPhone, customerEmail, quantity, deliveryAddress, notes } = body;

    if (!productId || !productName || !customerName || !customerPhone || !quantity || !deliveryAddress) {
      return NextResponse.json(
        { error: "Missing required fields: productId, productName, customerName, customerPhone, quantity, deliveryAddress" },
        { status: 400 }
      );
    }

    const qty = Number(quantity);

    // Stock check
    const product = getProduct(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 400 });
    }
    if (product.stock < qty) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    const order = {
      id: `ORD-${generateId()}`,
      productId,
      productName,
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      quantity: qty,
      deliveryAddress,
      notes: notes || "",
      status: "pending" as const,
      userId: payload.userId,
      createdAt: new Date().toISOString(),
    };

    // Save order then deduct stock atomically
    saveOrder(order as Parameters<typeof saveOrder>[0]);
    updateProduct(productId, { stock: product.stock - qty });

    // Fire-and-forget: generate payment slip and send email
    const whatsappPaymentLink = whatsappOrderConfirmed(order.id);
    ;(async () => {
      try {
        const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
        if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !order.customerEmail) return;

        let upiId = "auberon.pharma@oksbi";
        try {
          const settings = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data/settings.json"), "utf-8"));
          upiId = settings?.upiId || upiId;
        } catch { /* use fallback */ }

        const slipHtml = await generatePaymentSlipHTML({
          orderId: order.id,
          customerName: order.customerName,
          items: [{ name: order.productName, qty: order.quantity, price: product.price }],
          total: product.price * order.quantity,
          upiId,
        });

        const { subject, html } = paymentSlipEmailTemplate({
          name: order.customerName,
          orderId: order.id,
          slipHtml,
        });

        const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
        await t.sendMail({ from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`, to: order.customerEmail, subject, html });
      } catch (err) {
        console.error("[payment-slip] Failed to send slip email:", err);
      }
    })();

    return NextResponse.json({ success: true, orderId: order.id, whatsappPaymentLink }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
