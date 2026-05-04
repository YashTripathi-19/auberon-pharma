"use client";
import React, { useState, useEffect, useRef } from "react";
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

interface TaxConfig { sgst: number; cgst: number; handlingCharge: number; freeShippingAbove: number; }

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

function PriceRow({ label, value, color, bold, strikethrough }: { label: string; value: string; color?: string; bold?: boolean; strikethrough?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
      <span style={{ fontSize: "13px", color: color || "#6E6E73" }}>{label}</span>
      <span style={{ fontSize: bold ? "15px" : "13px", fontWeight: bold ? 700 : 500, color: color || "#6E6E73", textDecoration: strikethrough ? "line-through" : "none" }}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: "#e5e7eb", margin: "8px 0" }} />;
}

export default function CheckoutPageClient() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();

  const [roleDiscount, setRoleDiscount] = useState<{ percentage: number } | null>(null);
  const [liveSaleDiscount, setLiveSaleDiscount] = useState<{ percentage: number } | null>(null);
  const [taxConfig, setTaxConfig] = useState<TaxConfig>({ sgst: 6, cgst: 6, handlingCharge: 25, freeShippingAbove: 500 });
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number; description: string } | null>(null);
  const [stockIssues, setStockIssues] = useState<{ productId: string; productName: string; requestedQty: number; availableStock: number }[]>([]);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const navigatingAway = useRef(false)

  // Redirect if cart empty — but not if we just completed an order
  useEffect(() => {
    if (items.length === 0 && !navigatingAway.current) { router.replace("/shop"); return; }
  }, [items, router]);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.ok ? r.json() : null),
      fetch("/api/settings/role-discounts").then((r) => r.ok ? r.json() : null),
      fetch("/api/settings/tax-charges").then((r) => r.ok ? r.json() : null),
      fetch("/api/settings/live-sale").then((r) => r.ok ? r.json() : null),
    ]).then(([user, discounts, tax, liveSale]) => {
      if (!user) { router.replace("/login?redirect=/checkout"); return; }
      if (user.name) setValue("customerName", user.name);
      if (user.phone) setValue("customerPhone", user.phone);
      if (user.email) setValue("customerEmail", user.email);
      if (user.address) setValue("deliveryAddress", user.address);
      if (discounts && user.role) {
        const rd = discounts[user.role as keyof typeof discounts] as { percentage: number; isActive: boolean } | undefined;
        if (rd?.isActive && rd.percentage > 0) setRoleDiscount({ percentage: rd.percentage });
      }
      if (tax) setTaxConfig(tax);
      if (liveSale?.isActive && liveSale.discountPercentage > 0) {
        const appliesToUser = liveSale.applicableTo === "all" || liveSale.applicableTo === (user.role || "customer");
        if (appliesToUser) setLiveSaleDiscount({ percentage: liveSale.discountPercentage });
      }
    }).catch(() => {});
  }, [setValue, router]);

  // Price calculations
  const cartSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const roleDiscountAmount = roleDiscount ? Math.round((cartSubtotal * roleDiscount.percentage) / 100 * 100) / 100 : 0;
  const afterRoleDiscount = cartSubtotal - roleDiscountAmount;
  const liveSaleDiscountAmount = liveSaleDiscount ? Math.round((afterRoleDiscount * liveSaleDiscount.percentage) / 100 * 100) / 100 : 0;
  const afterLiveSale = afterRoleDiscount - liveSaleDiscountAmount;
  const couponDiscountAmount = couponApplied?.discount || 0;
  const taxableAmount = Math.max(0, afterLiveSale - couponDiscountAmount);
  const sgstAmount = Math.round((taxableAmount * taxConfig.sgst) / 100 * 100) / 100;
  const cgstAmount = Math.round((taxableAmount * taxConfig.cgst) / 100 * 100) / 100;
  const freeHandling = taxableAmount >= taxConfig.freeShippingAbove;
  const handlingCharge = freeHandling ? 0 : taxConfig.handlingCharge;
  const totalPayable = Math.round((taxableAmount + sgstAmount + cgstAmount + handlingCharge) * 100) / 100;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), cartTotal: afterLiveSale }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error || "Invalid coupon"); return; }
      setCouponApplied({ code: data.code, discount: data.discount, description: data.description });
    } catch { setCouponError("Failed to apply coupon"); }
    finally { setCouponLoading(false); }
  };

  const onSubmit = async (data: FormData) => {
    if (items.length === 0) return;
    setSubmitting(true);

    // Validate stock before payment
    try {
      const validateRes = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ productId: i.productId, productName: i.productName, quantity: i.quantity })) }),
      });
      const validateData = await validateRes.json();
      if (!validateData.valid && validateData.issues.length > 0) {
        setStockIssues(validateData.issues);
        for (const issue of validateData.issues) {
          updateQuantity(issue.productId, issue.availableStock);
        }
        addToast("info", "Some items were adjusted due to stock changes");
        setSubmitting(false);
        return;
      }
      setStockIssues([]);
    } catch { /* non-fatal, proceed */ }

    const loaded = await loadRazorpayScript();
    if (!loaded) { addToast("error", "Failed to load payment gateway."); setSubmitting(false); return; }

    try {
      const cartItems = items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.price }));
      const createRes = await fetch("/api/orders/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          couponCode: couponApplied?.code || null,
          roleDiscountPercentage: roleDiscount?.percentage || null,
          liveSalePercentage: liveSaleDiscount?.percentage || null,
          sgstAmount,
          cgstAmount,
          handlingCharge,
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
                  sgstAmount,
                  cgstAmount,
                  handlingCharge,
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

      navigatingAway.current = true;
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

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Left — Form (60%) */}
      <div className="lg:col-span-3">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-2xl border border-black/[0.06]" style={{ padding: "32px" }}>
            <p className="font-display text-[1.1rem] font-semibold text-primary" style={{ marginBottom: "24px" }}>Delivery Details</p>
            <div className="space-y-5">
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
            </div>
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-2xl border border-black/[0.06]" style={{ padding: "24px 32px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#c9933a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Have a coupon?</p>
            {!couponApplied ? (
              <>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input value={couponInput} onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }} disabled={couponLoading} className="input-premium" style={{ flex: 1 }} placeholder="Enter coupon code" />
                  <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()}
                    style={{ padding: "0 20px", borderRadius: "999px", border: "1.5px solid #1a2744", background: "transparent", color: "#1a2744", fontSize: "13px", fontWeight: 600, cursor: "pointer", flexShrink: 0, opacity: couponLoading || !couponInput.trim() ? 0.5 : 1 }}>
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
                <button type="button" onClick={() => { setCouponApplied(null); setCouponInput(""); }} style={{ fontSize: "12px", color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Remove</button>
              </div>
            )}
          </div>

          {stockIssues.length > 0 && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "14px 18px", marginBottom: "4px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#dc2626", marginBottom: "6px" }}>Stock adjusted:</p>
              {stockIssues.map((issue) => (
                <p key={issue.productId} style={{ fontSize: "12px", color: "#dc2626" }}>
                  {issue.productName}: requested {issue.requestedQty}, only {issue.availableStock} available
                </p>
              ))}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary btn-gold text-[14px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ padding: "16px 20px" }}
          >
            {submitting ? <><Loader2 size={15} className="animate-spin" /> Processing...</> : `Pay ${formatCurrency(totalPayable)}`}
          </button>
        </form>
      </div>

      {/* Right — Order Summary (40%) */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-black/[0.06] sticky top-24" style={{ padding: "28px" }}>
          <p className="font-display text-[1rem] font-semibold text-primary" style={{ marginBottom: "20px" }}>Order Summary</p>

          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
            {items.map((item) => (
              <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ fontSize: "13px", color: "#0B1F3A", flex: 1, lineHeight: 1.4 }}>{item.productName} <span style={{ color: "#9CA3AF" }}>× {item.quantity}</span></span>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#0B1F3A", flexShrink: 0 }}>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <Divider />

          {/* Price breakdown */}
          <PriceRow label="Subtotal" value={formatCurrency(cartSubtotal)} />
          {roleDiscount && roleDiscountAmount > 0 && (
            <PriceRow label={`Role Discount (${roleDiscount.percentage}%)`} value={`- ${formatCurrency(roleDiscountAmount)}`} color="#c9933a" />
          )}
          {liveSaleDiscount && liveSaleDiscountAmount > 0 && (
            <PriceRow label={`Live Sale (${liveSaleDiscount.percentage}%)`} value={`- ${formatCurrency(liveSaleDiscountAmount)}`} color="#dc2626" />
          )}
          {couponApplied && (
            <PriceRow label={`Coupon (${couponApplied.code})`} value={`- ${formatCurrency(couponDiscountAmount)}`} color="#16a34a" />
          )}

          <Divider />

          <PriceRow label="Taxable Amount" value={formatCurrency(taxableAmount)} />
          <PriceRow label={`CGST (${taxConfig.cgst}%)`} value={formatCurrency(cgstAmount)} />
          <PriceRow label={`SGST (${taxConfig.sgst}%)`} value={formatCurrency(sgstAmount)} />
          <PriceRow
            label="Handling Charges"
            value={freeHandling ? "FREE" : formatCurrency(handlingCharge)}
            color={freeHandling ? "#16a34a" : "#6E6E73"}
          />

          <Divider />

          <PriceRow label="TOTAL PAYABLE" value={formatCurrency(totalPayable)} color="#0B1F3A" bold />
        </div>
      </div>
    </div>
  );
}
