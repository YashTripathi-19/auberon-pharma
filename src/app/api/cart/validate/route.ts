import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json() as { items: { productId: string; productName: string; quantity: number }[] };
    const issues: { productId: string; productName: string; requestedQty: number; availableStock: number }[] = [];

    for (const item of items) {
      const product = getProduct(item.productId);
      const stock = product?.stock ?? 0;
      if (item.quantity > stock) {
        issues.push({ productId: item.productId, productName: item.productName, requestedQty: item.quantity, availableStock: stock });
      }
    }

    return NextResponse.json({ valid: issues.length === 0, issues });
  } catch {
    return NextResponse.json({ valid: true, issues: [] });
  }
}
