import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyUserToken, USER_COOKIE } from "@/lib/userAuth";

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

export async function POST(request: NextRequest) {
  try {
    // Auth guard — must be a signed-in user
    const token = request.cookies.get(USER_COOKIE)?.value;
    const payload = token ? await verifyUserToken(token) : null;
    if (!payload) {
      return NextResponse.json({ error: "Please sign in to request restock alerts" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, productName, orderId, requestedQty } = body;

    if (!productId || !productName) {
      return NextResponse.json(
        { error: "productId and productName are required" },
        { status: 400 }
      );
    }

    const notifications = readRestockNotifications();

    // Check if user already has a restock alert for this product
    const existing = notifications.find(
      (n) => n.productId === productId && n.userEmail === payload.email && !n.notified
    );

    if (existing) {
      return NextResponse.json(
        { error: "Already requested — we'll notify you when back in stock" },
        { status: 400 }
      );
    }

    // Create new restock notification
    const newNotification: RestockNotification = {
      id: `restock_${Date.now()}`,
      productId,
      productName,
      orderId: orderId || "",
      userEmail: payload.email,
      userName: payload.name || payload.email,
      requestedQty: requestedQty || 1,
      requestedAt: new Date().toISOString(),
      notified: false,
    };

    notifications.push(newNotification);
    writeRestockNotifications(notifications);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Restock request error:", error);
    return NextResponse.json(
      { error: "Failed to create restock request" },
      { status: 500 }
    );
  }
}
