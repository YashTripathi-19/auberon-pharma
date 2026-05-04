import { NextResponse } from "next/server";
import { getOrders, getProducts } from "@/lib/db";

export async function GET() {
  const cutoff = new Date(Date.now() - 90 * 86400000);
  const orders = getOrders().filter((o) => new Date(o.createdAt) >= cutoff);
  const products = getProducts().filter((p) => p.isActive && p.stock > 0);

  const soldMap: Record<string, number> = {};
  for (const o of orders) {
    const items = o.items?.length ? o.items : [{ productId: o.productId, quantity: o.quantity || 1 }];
    for (const item of items) {
      soldMap[item.productId] = (soldMap[item.productId] || 0) + item.quantity;
    }
  }

  const ranked = products
    .map((p) => ({ ...p, unitsSold: soldMap[p.id] || 0 }))
    .sort((a, b) => a.unitsSold - b.unitsSold)
    .slice(0, 5);

  return NextResponse.json(ranked);
}
