import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyUserToken, USER_COOKIE } from "@/lib/userAuth";
import { getProduct, getCouponByCode, getUserById, getSettings } from "@/lib/db";
import Razorpay from "razorpay";

interface CartItem { productId: string; quantity: number; unitPrice: number; }

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE)?.value;
    const payload = token ? await verifyUserToken(token) : null;
    if (!payload) return NextResponse.json({ message: "Please sign in to place an order" }, { status: 401 });

    const body = await request.json();
    const { items, couponCode, roleDiscountPercentage, sgstAmount, cgstAmount, handlingCharge } = body as {
      items: CartItem[];
      couponCode?: string | null;
      roleDiscountPercentage?: number | null;
      sgstAmount?: number | null;
      cgstAmount?: number | null;
      handlingCharge?: number | null;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }

    for (const item of items) {
      const product = getProduct(item.productId);
      if (!product) return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      if (product.stock < item.quantity) return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
    }

    let subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    // Apply role discount first
    let roleDiscountAmount = 0;
    if (roleDiscountPercentage && roleDiscountPercentage > 0) {
      roleDiscountAmount = Math.round((subtotal * roleDiscountPercentage) / 100 * 100) / 100;
      subtotal = subtotal - roleDiscountAmount;
    }

    // Apply coupon on discounted subtotal
    let couponDiscountAmount = 0;
    let appliedCouponCode: string | null = null;
    if (couponCode) {
      const coupon = getCouponByCode(couponCode);
      if (coupon && coupon.isActive && (!coupon.expiresAt || new Date(coupon.expiresAt) >= new Date())) {
        if (coupon.applicableTo !== "all") {
          const user = getUserById(payload.userId);
          if (user?.role !== coupon.applicableTo) {
            return NextResponse.json({ error: "Coupon not applicable to your account type" }, { status: 400 });
          }
        }
        if (coupon.type === "percentage") {
          couponDiscountAmount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscountAmount !== null) couponDiscountAmount = Math.min(couponDiscountAmount, coupon.maxDiscountAmount);
        } else {
          couponDiscountAmount = Math.min(coupon.value, subtotal);
        }
        couponDiscountAmount = Math.round(couponDiscountAmount * 100) / 100;
        appliedCouponCode = coupon.code;
      }
    }

    const totalDiscount = roleDiscountAmount + couponDiscountAmount;
    const taxableAmount = Math.max(0, subtotal - couponDiscountAmount);
    const sgst = sgstAmount || 0;
    const cgst = cgstAmount || 0;
    const handling = handlingCharge || 0;
    const finalTotal = Math.max(0, taxableAmount + sgst + cgst + handling);
    const amountInPaise = Math.round(finalTotal * 100);

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { itemCount: String(items.length) },
    });

    return NextResponse.json({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      discountAmount: totalDiscount,
      couponCode: appliedCouponCode,
      sgstAmount: sgst,
      cgstAmount: cgst,
      handlingCharge: handling,
    });
  } catch (err) {
    console.error("[create-payment]", err);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
