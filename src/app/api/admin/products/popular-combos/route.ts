import { NextResponse } from "next/server";
import { getOrders, getProducts } from "@/lib/db";

export async function GET() {
  const orders = getOrders();
  const products = getProducts();
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  const pairCount: Record<string, number> = {};
  for (const order of orders) {
    const ids = order.items?.length ? order.items.map((i) => i.productId) : [order.productId];
    const unique = [...new Set(ids)];
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        const key = [unique[i], unique[j]].sort().join("||");
        pairCount[key] = (pairCount[key] || 0) + 1;
      }
    }
  }

  const pairs = Object.entries(pairCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => {
      const [a, b] = key.split("||");
      return { productA: a, productB: b, nameA: productMap.get(a) || a, nameB: productMap.get(b) || b, count };
    });

  return NextResponse.json(pairs);
}
