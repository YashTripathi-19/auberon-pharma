import { NextResponse } from "next/server";
import { getOrders, updateOrder, getProduct, updateProduct } from "@/lib/db";

// NOTE: This endpoint is triggered client-side from the admin dashboard on mount.
// Before production deployment, replace this with a proper Vercel cron job:
// https://vercel.com/docs/cron-jobs
// Add to vercel.json: { "crons": [{ "path": "/api/admin/cron/expire-orders", "schedule": "0 * * * *" }] }

export async function GET() {
  try {
    const orders = getOrders();
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    const expired: string[] = [];

    for (const order of orders) {
      if (
        order.status === "pending" &&
        now - new Date(order.createdAt).getTime() > twentyFourHours
      ) {
        // Revert stock
        const product = getProduct(order.productId);
        if (product) {
          updateProduct(order.productId, { stock: product.stock + order.quantity });
        }
        updateOrder(order.id, { status: "expired" });
        expired.push(order.id);
      }
    }

    return NextResponse.json({ success: true, expiredCount: expired.length, expiredIds: expired });
  } catch {
    return NextResponse.json({ error: "Failed to run expiry job" }, { status: 500 });
  }
}
