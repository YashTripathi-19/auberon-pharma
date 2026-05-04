import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";

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

export async function GET(request: NextRequest) {
  try {
    // Admin JWT auth check
    const token = await getTokenFromCookies();
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read and sort by requestedAt descending (newest first)
    const notifications = readRestockNotifications();
    notifications.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Failed to fetch restock notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch restock notifications" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Admin JWT auth check
    const token = await getTokenFromCookies();
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id parameter is required" }, { status: 400 });
    }

    const notifications = readRestockNotifications();
    const filtered = notifications.filter((n) => n.id !== id);

    if (filtered.length === notifications.length) {
      return NextResponse.json({ error: "Restock request not found" }, { status: 404 });
    }

    writeRestockNotifications(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete restock notification:", error);
    return NextResponse.json(
      { error: "Failed to delete restock notification" },
      { status: 500 }
    );
  }
}
