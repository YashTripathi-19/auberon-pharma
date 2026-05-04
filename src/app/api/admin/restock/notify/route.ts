import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import nodemailer from "nodemailer";
import { restockTemplate } from "@/lib/email-templates";

const dataDir = path.join(process.cwd(), "data");

interface RestockNotification {
  id: string;
  productId: string;
  productName: string;
  orderId: string;
  userEmail: string;
  userName: string;
  requestedQty: number;
  requestedAt: string;
  notified: boolean;
  notifiedAt?: string;
}

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  category: string;
  isActive: boolean;
}

function readRestockNotifications(): RestockNotification[] {
  const filePath = path.join(dataDir, "restock-notifications.json");
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as RestockNotification[];
  } catch {
    return [];
  }
}

function writeRestockNotifications(notifications: RestockNotification[]): void {
  const filePath = path.join(dataDir, "restock-notifications.json");
  fs.writeFileSync(filePath, JSON.stringify(notifications, null, 2), "utf-8");
}

function readProducts(): Product[] {
  const filePath = path.join(dataDir, "products.json");
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as Product[];
  } catch {
    return [];
  }
}

// Singleton transporter
let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      pool: true,
      maxConnections: 3,
      rateDelta: 1000,
      rateLimit: 5,
    });
  }
  return _transporter;
}

export async function POST(request: NextRequest) {
  try {
    // Admin JWT auth check
    const token = await getTokenFromCookies();
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Read all restock notifications
    const notifications = readRestockNotifications();

    // Find all entries where productId matches AND notified === false
    const pendingNotifications = notifications.filter(
      (n) => n.productId === productId && !n.notified
    );

    if (pendingNotifications.length === 0) {
      return NextResponse.json(
        { success: true, notifiedCount: 0, message: "No pending notifications for this product" },
        { status: 200 }
      );
    }

    // Stock validation: check if current stock >= total requested quantity
    const products = readProducts();
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const totalRequestedQty = pendingNotifications.reduce(
      (sum, n) => sum + (n.requestedQty || 1),
      0
    );

    if (product.stock < totalRequestedQty) {
      return NextResponse.json(
        {
          error: "Insufficient stock",
          message: `Current stock (${product.stock}) is less than total requested quantity (${totalRequestedQty}). Please add stock before notifying customers.`,
          currentStock: product.stock,
          totalRequested: totalRequestedQty,
        },
        { status: 400 }
      );
    }

    const transporter = getTransporter();
    let notifiedCount = 0;

    // Send email to each pending notification
    for (const entry of pendingNotifications) {
      try {
        const { subject, html } = restockTemplate({
          name: entry.userName,
          productName: entry.productName,
        });

        await transporter.sendMail({
          from: `"Auberon Pharmaceuticals" <${process.env.GMAIL_USER}>`,
          to: entry.userEmail,
          subject,
          html,
        });

        // Mark as notified
        entry.notified = true;
        entry.notifiedAt = new Date().toISOString();
        notifiedCount++;
      } catch (emailError) {
        console.error(`Failed to send email to ${entry.userEmail}:`, emailError);
        // Continue with other emails even if one fails
      }
    }

    // Save updated notifications
    writeRestockNotifications(notifications);

    return NextResponse.json({
      success: true,
      notifiedCount,
    });
  } catch (error) {
    console.error("Failed to send restock notifications:", error);
    return NextResponse.json(
      { error: "Failed to send restock notifications" },
      { status: 500 }
    );
  }
}
