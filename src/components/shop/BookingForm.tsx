"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface FormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  notes: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BookingForm() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number; description: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Role discount state
  const [roleDiscount, setRoleDiscount] = useState<{ percentage: number; amount: number } | null>(null);

  const cartSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const roleDiscountAmount = roleDiscount?.amount || 0;
  const couponDiscountAmount = couponApplied?.discount || 0;
  const totalDiscount = roleDiscountAmount + couponDiscountAmount;
  const finalTotal = Math.max(0, cartSubtotal - totalDiscount);

  useEffect(() => {
    // Load user + role discounts in parallel
    Promise.all([
      fetch("/api/auth/me").then((r) => r.ok ? r.json() : null),
      fetch("/api/settings/role-discounts").then((r) => r.ok ? r.json() : null),
    ]).then(([user, discounts]) => {
      if (user) {
        if (user.name) setValue("customerName", user.name);
        if (user.phone) setValue("customerPhone", user.phone);
        if (user.email) setValue("customerEmail", user.email);
        if (user.address) setValue("deliveryAddress", user.address);

        // Apply role discount if active
        if (discounts && user.role) {
          const rd = discounts[user.role as keyof typeof discounts] as { percentage: number; isActive: boolean } | undefined;
          if (rd?.isActive && rd.percentage > 0) {
            const amount = Math.round((cartSubtotal * rd.percentage) / 100 * 100) / 100;
            setRoleDiscount({ percentage: rd.percentage, amount });
          }
        }
      }
    }).catch(() => {});
  }, [setValue, cartSubtotal]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const subtotalAfterRole = cartSubtotal - roleDiscountAmount;
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), cartTotal: subtotalAfterRole }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error || "Invalid coupon"); return; }
      setCouponApplied({ code: data.code, discount: data.discount, description: data.description });
    } catch {
      setCouponError("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponInput("");
    setCouponError("");
  };

  const onSubmit = async (data: FormData) => {
    if (items.length === 0) { addToast("error", "Add at least one product first."); return; }
    setSubmitting(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      addToast("error", "Failed to load payment gateway. Please check your connection.");
      setSubmitting(false);
      return;
    }

    try {
      const cartItems = items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.price }));

      const createRes = await fetch("/api/orders/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          couponCode: couponApplied?.code || null,
          roleDiscountPercentage: roleDiscount?.percentage || null,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Failed to initiate payment");

      const orderId = await new Promise<string>((resolve, reject) => {
        const options = {
          key: createData.keyId,
          amount: createData.amount,
          currency: createData.currency,
          name: "Auberon Pharmaceuticals",
          description: `Order for ${items.length} item${items.length !== 1 ? "s" : ""}`,
          order_id: createData.razorpayOrderId,
          prefill: { name: data.customerName, email: data.customerEmail, contact: data.customerPhone },
          theme: { color: "#c9933a" },
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              const verifyRes = await fetch("/api/orders/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  items: items.map((i) => ({ productId: i.productId, productName: i.productName, quantity: i.quantity, unitPrice: i.price })),
                  customerDetails: { name: data.customerName, phone: data.customerPhone, email: data.customerEmail, address: data.deliveryAddress, notes: data.notes },
                  amountPaid: createData.amount,
                  couponCode: createData.couponCode || null,
                  discountAmount: createData.discountAmount || null,
                  roleDiscountPercentage: roleDiscount?.percentage || null,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.message || "Payment verification failed");
              resolve(verifyData.orderId);
            } catch (err) { reject(err); }
          },
          modal: { ondismiss: () => reject(new Error("cancelled")) },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      });

      router.push(`/shop/confirmation?id=${orderId}&name=${encodeURIComponent(data.customerName)}&paid=true`);
      clearCart();
      addToast("success", "Payment successful! Order confirmed.");
    } catch (err) {
      if (err instanceof Error && err.message === "cancelled") {
        addToast("info", "Payment cancelled.");
      } else {
        addToast("error", err instanceof Error ? err.message : "Payment failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const lbl = "block text-[11px] font-semibold text-muted uppercase tracking-[0.1em]";
  const errCls = "text-[11px] text-red-500 mt-1.5";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="font-display text-[1.2rem] font-semibold text-primary" style={{ marginBottom: "4px" }}>Booking Details</p>

      <div>
        <label htmlFor="customerName" className={lbl} style={{ marginBottom: "8px" }}>Full Name <span className="text-red-400">*</span></label>
        <input id="customerName" {...register("customerName", { required: "Required", minLength: { value: 2, message: "Min 2 characters" } })} className="input-premium" placeholder="Your full name" />
        {errors.customerName && <p className={errCls}>{errors.customerName.message}</p>}
      </div>

      <div>
        <label htmlFor="customerPhone" className={lbl} style={{ marginBottom: "8px" }}>Phone <span className="text-red-400">*</span></label>
        <input id="customerPhone" {...register("customerPhone", { required: "Required", pattern: { value: /^[+]?[\d\s-]{10,15}$/, message: "Invalid phone number" } })} className="input-premium" placeholder="+91 98765 43210" />
        {errors.customerPhone && <p className={errCls}>{errors.customerPhone.message}</p>}
      </div>

      <div>
        <label htmlFor="customerEmail" className={lbl} style={{ marginBottom: "8px" }}>Email <span className="text-muted/50 normal-case font-normal">(optional)</span></label>
        <input id="customerEmail" type="email" {...register("customerEmail", { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })} className="input-premium" placeholder="you@example.com" />
        {errors.customerEmail && <p className={errCls}>{errors.customerEmail.message}</p>}
      </div>

      <div>
        <label htmlFor="deliveryAddress" className={lbl} style={{ marginBottom: "8px" }}>Delivery Address <span className="text-red-400">*</span></label>
        <textarea id="deliveryAddress" rows={3} {...register("deliveryAddress", { required: "Required", minLength: { value: 10, message: "Please enter a complete address" } })} className="input-premium" placeholder="House/Flat No., Street, City, State, PIN" />
        {errors.deliveryAddress && <p className={errCls}>{errors.deliveryAddress.message}</p>}
      </div>

      <div>
        <label htmlFor="notes" className={lbl} style={{ marginBottom: "8px" }}>Notes <span className="text-muted/50 normal-case font-normal">(optional)</span></label>
        <textarea id="notes" rows={2} {...register("notes")} className="input-premium" placeholder="Any special instructions" />
      </div>

      {/* Coupon input */}
      <div>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#c9933a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Have a coupon?</p>
        {!couponApplied ? (
          <>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                disabled={couponLoading}
                className="input-premium"
                style={{ flex: 1 }}
                placeholder="Enter coupon code"
                aria-label="Coupon code"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponInput.trim()}
                style={{ padding: "0 20px", borderRadius: "999px", border: "1.5px solid #1a2744", background: "transparent", color: "#1a2744", fontSize: "13px", fontWeight: 600, cursor: "pointer", flexShrink: 0, opacity: couponLoading || !couponInput.trim() ? 0.5 : 1 }}
              >
                {couponLoading ? "Applying…" : "Apply"}
              </button>
            </div>
            {couponError && <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "6px" }}>{couponError}</p>}
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "12px", padding: "10px 14px" }}>
            <p style={{ fontSize: "13px", color: "#16a34a", fontWeight: 500 }}>
              <span style={{ fontWeight: 700 }}>{couponApplied.code}</span> — {couponApplied.description} · {formatCurrency(couponApplied.discount)} off
            </p>
            <button type="button" onClick={handleRemoveCoupon} style={{ fontSize: "12px", color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>Remove</button>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      {items.length > 0 && (
        <div style={{ background: "#F5F5F7", borderRadius: "12px", padding: "14px 18px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: "#6E6E73" }}>Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
            <span style={{ fontSize: "13px", color: "#6E6E73" }}>{formatCurrency(cartSubtotal)}</span>
          </div>
          {roleDiscount && roleDiscount.amount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "#c9933a" }}>Role discount ({roleDiscount.percentage}%)</span>
              <span style={{ fontSize: "13px", color: "#c9933a" }}>- {formatCurrency(roleDiscount.amount)}</span>
            </div>
          )}
          {couponApplied && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "#16a34a" }}>Coupon ({couponApplied.code})</span>
              <span style={{ fontSize: "13px", color: "#16a34a" }}>- {formatCurrency(couponApplied.discount)}</span>
            </div>
          )}
          {totalDiscount > 0 && (
            <div style={{ height: "1px", background: "rgba(0,0,0,0.08)", margin: "2px 0" }} />
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#0B1F3A" }}>Total</span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#0B1F3A" }}>{formatCurrency(finalTotal)}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || items.length === 0}
        className="w-full btn-primary btn-gold text-[14px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ padding: "14px 20px" }}
        aria-label="Proceed to payment"
      >
        {submitting ? (
          <><Loader2 size={15} className="animate-spin" /> Processing...</>
        ) : (
          `Pay ${formatCurrency(finalTotal)}`
        )}
      </button>
    </form>
  );
}
