"use client";
import React from "react";
import { Order } from "@/types/order";
import Modal from "@/components/ui/Modal";
import { formatDate, formatCurrency } from "@/lib/utils";
import { User, Phone, Mail, MapPin, Package, FileText, Clock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  confirmed: "bg-blue-50 text-blue-600 border-blue-100",
  dispatched: "bg-gray-100 text-gray-600 border-gray-200",
  delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

const steps = ["pending", "confirmed", "dispatched", "delivered"];

export default function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const currentStep = steps.indexOf(order.status);
  const total = order.totalAmount || (order.amountPaid ? order.amountPaid / 100 : 0);

  return (
    <Modal isOpen={true} onClose={onClose} title={`Order ${order.id}`} size="lg">
      {/* Status timeline */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {steps.map((step, i) => (
            <React.Fragment key={step}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 700,
                  background: i <= currentStep ? "#0B1F3A" : "#F5F5F7",
                  color: i <= currentStep ? "white" : "#6E6E73",
                  transition: "all 0.2s",
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: "10px", color: i <= currentStep ? "#C9963E" : "#6E6E73", marginTop: "8px", textTransform: "capitalize", fontWeight: i <= currentStep ? 600 : 400 }}>{step}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: "2px", margin: "0 8px", marginBottom: "20px", background: i < currentStep ? "#0B1F3A" : "rgba(0,0,0,0.08)", transition: "background 0.2s" }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Customer details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        <DetailRow icon={User} label="Customer" value={order.customerName} />
        <DetailRow icon={Phone} label="Phone" value={order.customerPhone} />
        <DetailRow icon={Mail} label="Email" value={order.customerEmail || "—"} />
        <DetailRow icon={Clock} label="Ordered" value={formatDate(order.createdAt)} />
        <DetailRow icon={MapPin} label="Address" value={order.deliveryAddress} span={2} />
        {order.notes && <DetailRow icon={FileText} label="Notes" value={order.notes} span={2} />}
      </div>

      {/* Items table */}
      {order.items && order.items.length > 0 && (
        <div style={{ background: "#F5F5F7", borderRadius: "14px", padding: "20px", marginBottom: "12px" }}>
          <p style={{ fontSize: "10px", color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Package size={11} strokeWidth={1.5} /> Items
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Product", "Qty", "Unit Price", "Total"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: "10px", color: "#9CA3AF", fontWeight: 600, padding: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <td style={{ padding: "8px 0", fontSize: "13px", color: "#0B1F3A" }}>{item.productName}</td>
                  <td style={{ padding: "8px 0", fontSize: "13px", color: "#6E6E73" }}>{item.quantity}</td>
                  <td style={{ padding: "8px 0", fontSize: "13px", color: "#6E6E73" }}>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: 600, color: "#0B1F3A" }}>{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid rgba(0,0,0,0.1)" }}>
                <td colSpan={3} style={{ padding: "10px 0 0", fontSize: "13px", fontWeight: 700, color: "#0B1F3A" }}>Total</td>
                <td style={{ padding: "10px 0 0", fontSize: "13px", fontWeight: 700, color: "#0B1F3A" }}>{formatCurrency(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Status + Payment */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ background: "#F5F5F7", borderRadius: "14px", padding: "20px" }}>
          <p style={{ fontSize: "10px", color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "10px" }}>Status</p>
          <span className={cn("text-[12px] font-semibold px-4 py-1.5 rounded-full border capitalize", statusStyle[order.status] || "bg-gray-100 text-gray-600")}>
            {order.status}
          </span>
        </div>
        <div style={{ background: "#F5F5F7", borderRadius: "14px", padding: "20px" }}>
          <p style={{ fontSize: "10px", color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <CreditCard size={11} strokeWidth={1.5} /> Payment
          </p>
          {/* Discount breakdown */}
          {(order.discountAmount || order.roleDiscountPercentage) ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6E6E73" }}>
                <span>Subtotal</span>
                <span>{formatCurrency((order.amountPaid ? order.amountPaid / 100 : 0) + (order.discountAmount || 0))}</span>
              </div>
              {order.roleDiscountPercentage ? (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#c9933a" }}>
                  <span>Role Discount ({order.roleDiscountPercentage}%)</span>
                  <span>- included</span>
                </div>
              ) : null}
              {order.couponCode ? (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#16a34a" }}>
                  <span>Coupon ({order.couponCode})</span>
                  <span>- {formatCurrency(order.discountAmount || 0)}</span>
                </div>
              ) : null}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, color: "#0B1F3A", borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "6px" }}>
                <span>Amount Paid</span>
                <span>{formatCurrency(order.amountPaid ? order.amountPaid / 100 : 0)}</span>
              </div>
            </div>
          ) : null}
          <span style={{ fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "999px", textTransform: "capitalize",
            background: order.paymentStatus === "paid" ? "#f0fdf4" : order.paymentStatus === "refunded" ? "#F5F5F7" : order.paymentStatus === "failed" ? "#fef2f2" : "#fffbeb",
            color: order.paymentStatus === "paid" ? "#16a34a" : order.paymentStatus === "refunded" ? "#6E6E73" : order.paymentStatus === "failed" ? "#dc2626" : "#92400e",
          }}>
            {order.paymentStatus || "pending"}
          </span>
          {order.paymentId && <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "6px" }}>{order.paymentId}</p>}
        </div>
      </div>
    </Modal>
  );
}

function DetailRow({ icon: Icon, label, value, span = 1 }: {
  icon: React.ComponentType<{ size: number; className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  span?: number;
}) {
  return (
    <div style={{ background: "#F5F5F7", borderRadius: "14px", padding: "20px", gridColumn: span === 2 ? "1 / -1" : undefined }}>
      <p style={{ fontSize: "10px", color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
        <Icon size={11} className="text-muted" strokeWidth={1.5} />
        {label}
      </p>
      <p style={{ fontSize: "14px", fontWeight: 500, color: "#0B1F3A", lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}
