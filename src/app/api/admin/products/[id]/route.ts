import { NextRequest, NextResponse } from "next/server";
import { getProduct, updateProduct, deleteProduct, getRestockNotificationsByProduct, markRestockNotified } from "@/lib/db";
import nodemailer from "nodemailer";
import { restockTemplate } from "@/lib/email-templates";

async function sendRestockEmails(productId: string, productName: string, newStock: number) {
  const waiting = getRestockNotificationsByProduct(productId);
  if (waiting.length === 0) return;
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return;
  const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
  let sent = 0;
  for (const n of waiting) {
    const { subject, html } = restockTemplate({ name: n.userName, productName });
    await t.sendMail({
      from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
      to: n.userEmail,
      subject,
      html,
    }).catch(() => {});
    markRestockNotified(n.id);
    sent++;
  }
  console.log(`[restock] Sent ${sent} notification(s) for ${productName} (stock: ${newStock})`);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const product = getProduct(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const prevProduct = getProduct(id);
    const updated = updateProduct(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    // Trigger restock notifications if stock went from 0/low to available
    if (prevProduct && (prevProduct.stock === 0) && updated.stock > 0) {
      sendRestockEmails(id, updated.name, updated.stock).catch(() => {});
    }
    return NextResponse.json({ success: true, product: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const deleted = deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
