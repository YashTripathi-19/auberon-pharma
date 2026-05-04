import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyUserToken, USER_COOKIE } from "@/lib/userAuth";
import { getCouponByCode, getUserById } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE)?.value;
    const payload = token ? await verifyUserToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

    const { code, cartTotal } = await request.json() as { code: string; cartTotal: number };
    if (!code) return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });

    const coupon = getCouponByCode(code);
    if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    if (!coupon.isActive) return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    if (cartTotal < coupon.minOrderValue) return NextResponse.json({ error: `Minimum order value of Rs. ${coupon.minOrderValue} required for this coupon` }, { status: 400 });

    // Role check
    if (coupon.applicableTo !== "all") {
      const user = getUserById(payload.userId);
      const userRole = user?.role || "customer";
      if (userRole !== coupon.applicableTo) return NextResponse.json({ error: "This coupon is not applicable to your account type" }, { status: 400 });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (cartTotal * coupon.value) / 100;
      if (coupon.maxDiscountAmount !== null) discount = Math.min(discount, coupon.maxDiscountAmount);
    } else {
      discount = Math.min(coupon.value, cartTotal);
    }
    discount = Math.round(discount * 100) / 100;

    return NextResponse.json({
      valid: true,
      discount,
      finalTotal: Math.max(0, cartTotal - discount),
      description: coupon.description,
      code: coupon.code,
    });
  } catch (err) {
    console.error("[validate-coupon]", err);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
