import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getCoupons, createCoupon } from "@/lib/db";
import { Coupon } from "@/types/coupon";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return token ? await verifyToken(token) : false;
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const coupons = getCoupons().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(coupons);
}

export async function POST(request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = await request.json();
    const coupon: Coupon = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      code: String(body.code).toUpperCase().replace(/[^A-Z0-9-]/g, ""),
      description: body.description,
      type: body.type,
      value: Number(body.value),
      minOrderValue: Number(body.minOrderValue) || 0,
      maxDiscountAmount: body.maxDiscountAmount ? Number(body.maxDiscountAmount) : null,
      applicableTo: body.applicableTo || "all",
      usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
      usageCount: 0,
      isActive: body.isActive !== false,
      expiresAt: body.expiresAt || null,
      createdAt: new Date().toISOString(),
    };
    createCoupon(coupon);
    return NextResponse.json(coupon, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
