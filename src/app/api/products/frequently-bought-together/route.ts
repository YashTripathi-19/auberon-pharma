import { NextRequest, NextResponse } from "next/server";
import { getOrders, getProducts } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const orders = getOrders();
  const products = getProducts();

  // Find orders containing this product
  const coCount: Record<string, number> = {};
  for (const order of orders) {
    const ids = order.items?.map((i) => i.productId) || [order.productId];
    if (!ids.includes(productId)) continue;
    for (const id of ids) {
      if (id !== productId) coCount[id] = (coCount[id] || 0) + 1;
    }
  }

  const sorted = Object.entries(coCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id);

  // Fill with random active products if not enough
  const activeProducts = products.filter((p) => p.isActive && p.id !== productId);
  const result = sorted
    .map((id) => activeProducts.find((p) => p.id === id))
    .filter(Boolean);

  while (result.length < 3 && activeProducts.length > result.length) {
    const candidate = activeProducts.find((p) => !result.some((r) => r?.id === p.id));
    if (candidate) result.push(candidate);
    else break;
  }

  return NextResponse.json(result.slice(0, 3));
}
