"use client";
import React, { useState } from "react";
import { Order } from "@/types/order";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";
import { Eye, ChevronDown, ChevronUp } from "lucide-react";
import OrderDetailModal from "./OrderDetailModal";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  confirmed: "bg-blue-50 text-blue-600",
  dispatched: "bg-gray-100 text-gray-600",
  delivered: "bg-emerald-50 text-emerald-600",
  rejected: "bg-red-50 text-red-600",
  expired: "bg-gray-200 text-gray-500",
};

const paymentStyle: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-gray-100 text-gray-500",
};

function getItemsLabel(order: Order): string {
  if (order.items && order.items.length > 1) return `${order.items.length} items`;
  if (order.items && order.items.length === 1) return order.items[0].productName;
  return order.productName || "—";
}

function getOrderTotal(order: Order): number {
  if (order.totalAmount) return order.totalAmount;
  if (order.amountPaid) return order.amountPaid / 100;
  return 0;
}

function isTerminal(order: Order): boolean {
  return (
    order.status === "rejected" ||
    order.status === "expired" ||
    order.status === "delivered" ||
    order.paymentStatus === "refunded"
  );
}

export default function OrdersTable({
  orders,
  onOrderUpdate,
}: {
  orders: Order[];
  onOrderUpdate: (id: string, updates: Partial<Order>) => void;
}) {
  const [selected, setSelected] = useState<Order | null>(null);
  const [refundOpen, setRefundOpen] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState<Record<string, string>>({});
  const [refunding, setRefunding] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  const handleStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      onOrderUpdate(orderId, { status: newStatus as Order["status"] });
      addToast("success", `Status updated to ${newStatus}`);
    } catch {
      addToast("error", "Failed to update status");
    }
  };

  const handleReject = async (order: Order) => {
    const isPaid = order.paymentStatus === "paid" || (!order.paymentStatus && !!order.paymentId);
    const amtRs = order.amountPaid
      ? `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(order.amountPaid / 100)}`
      : "";

    const confirmMsg = isPaid
      ? `This order has been paid${amtRs ? ` (${amtRs})` : ""}. Rejecting will automatically initiate a refund. Continue?`
      : `Reject order ${order.id.slice(0, 16)}…? Stock will be reverted.`;

    if (!window.confirm(confirmMsg)) return;

    setRejecting(order.id);
    try {
      // If paid, attempt refund first
      if (isPaid) {
        const refundRes = await fetch("/api/orders/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id, reason: "Order rejected by admin" }),
        });
        if (!refundRes.ok) {
          addToast("error", "Refund failed — please process manually");
          // Still proceed with rejection
        }
      }

      // Reject the order
      const rejectRes = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (!rejectRes.ok) throw new Error();

      // Atomic state update — both status and paymentStatus at once
      onOrderUpdate(order.id, {
        status: "rejected",
        ...(isPaid ? { paymentStatus: "refunded" } : {}),
      });
      addToast("success", isPaid ? "Order rejected — refund initiated" : "Order rejected");
    } catch {
      addToast("error", "Failed to reject order");
    } finally {
      setRejecting(null);
    }
  };

  const handleRefund = async (orderId: string) => {
    setRefunding(orderId);
    try {
      const res = await fetch("/api/orders/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason: refundReason[orderId] || "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refund failed");
      // Atomic update — keep order in list, just update paymentStatus
      onOrderUpdate(orderId, { paymentStatus: "refunded" });
      addToast("success", "Refund processed — customer notified");
      setRefundOpen(null);
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Refund failed");
    } finally {
      setRefunding(null);
    }
  };

  const colSpan = 9;

  return (
    <>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Orders table">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#F5F5F7" }}>
              {["Order ID", "Customer", "Phone", "Items", "Total", "Date", "Status", "Payment", ""].map((h) => (
                <th key={h} style={{ padding: "16px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={colSpan} style={{ textAlign: "center", padding: "64px 20px", fontSize: "14px", color: "#6E6E73" }}>No orders found</td></tr>
            ) : (
              orders.map((order, i) => {
                const isMultiItem = order.items && order.items.length > 1;
                const isExpanded = expandedItems === order.id;
                const total = getOrderTotal(order);
                const hasRefundPanel = refundOpen === order.id;
                const hasSub = hasRefundPanel || isExpanded;
                const terminal = isTerminal(order);
                const isPaid = order.paymentStatus === "paid" || (!order.paymentStatus && !!order.paymentId);
                const canReject = !terminal && (order.status === "pending" || order.status === "confirmed");

                return (
                  <React.Fragment key={order.id}>
                    <tr
                      style={{ borderBottom: hasSub ? "none" : i < orders.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}
                      className="hover:bg-[#F5F5F7] transition-colors"
                    >
                      <td style={{ padding: "18px 20px", fontFamily: "monospace", fontSize: "11px", color: "#6E6E73" }}>{order.id.slice(0, 16)}…</td>
                      <td style={{ padding: "18px 20px", fontSize: "13px", fontWeight: 500, color: "#0B1F3A" }}>{order.customerName}</td>
                      <td style={{ padding: "18px 20px", fontSize: "13px", color: "#6E6E73" }}>{order.customerPhone}</td>
                      <td style={{ padding: "18px 20px", fontSize: "13px", color: "#0B1F3A", maxWidth: "180px" }}>
                        {isMultiItem ? (
                          <button
                            onClick={() => setExpandedItems(isExpanded ? null : order.id)}
                            style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#1a2744", fontSize: "13px", fontWeight: 500 }}
                            aria-label={`${isExpanded ? "Collapse" : "Expand"} items for order ${order.id}`}
                          >
                            {order.items.length} items
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        ) : (
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{getItemsLabel(order)}</span>
                        )}
                      </td>
                      <td style={{ padding: "18px 20px", fontSize: "13px", color: "#0B1F3A", whiteSpace: "nowrap" }}>
                        {total > 0 ? formatCurrency(total) : "—"}
                      </td>
                      <td style={{ padding: "18px 20px", fontSize: "11px", color: "#6E6E73", whiteSpace: "nowrap" }}>{formatDate(order.createdAt)}</td>
                      <td style={{ padding: "18px 20px" }}>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatus(order.id, e.target.value)}
                          disabled={terminal}
                          className={cn(
                            "text-[11px] font-semibold px-3 py-1.5 rounded-full border-0 focus:outline-none capitalize",
                            terminal ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                            statusStyle[order.status] || "bg-gray-100 text-gray-600"
                          )}
                          aria-label={`Status for order ${order.id}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                          <option value="rejected" disabled>Rejected</option>
                          <option value="expired" disabled>Expired</option>
                        </select>
                      </td>
                      <td style={{ padding: "18px 20px" }}>
                        {order.paymentStatus === "refunded" ? (
                          <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px", background: "#F5F5F7", color: "#6E6E73" }}>
                            Refunded
                          </span>
                        ) : (
                          <span className={cn("text-[11px] font-semibold px-3 py-1.5 rounded-full capitalize", paymentStyle[order.paymentStatus || "pending"] || "bg-gray-100 text-gray-600")}>
                            {order.paymentStatus || "pending"}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "18px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          {canReject && (
                            <button
                              onClick={() => handleReject(order)}
                              disabled={rejecting === order.id}
                              style={{ width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: rejecting === order.id ? "not-allowed" : "pointer", fontSize: "13px", opacity: rejecting === order.id ? 0.5 : 1 }}
                              className="hover:bg-red-50 transition-colors text-red-400 hover:text-red-600"
                              aria-label={`Reject order ${order.id}`} title="Reject order">
                              ✕
                            </button>
                          )}
                          {isPaid && !terminal && (
                            <button
                              onClick={() => setRefundOpen(refundOpen === order.id ? null : order.id)}
                              style={{ fontSize: "11px", fontWeight: 500, color: "#dc2626", background: "none", border: "1px solid #fecaca", borderRadius: "8px", padding: "4px 10px", cursor: "pointer", whiteSpace: "nowrap" }}
                              className="hover:bg-red-50 transition-colors">
                              Refund
                            </button>
                          )}
                          <button onClick={() => setSelected(order)}
                            style={{ width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }}
                            className="hover:bg-black/[0.06] transition-colors"
                            aria-label={`View order ${order.id}`}>
                            <Eye size={15} style={{ color: "#6E6E73" }} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded items sub-table */}
                    {isExpanded && order.items && (
                      <tr style={{ background: "#F9F9FB", borderBottom: hasRefundPanel ? "none" : "1px solid rgba(0,0,0,0.04)" }}>
                        <td colSpan={colSpan} style={{ padding: "0 20px 16px 60px" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr>
                                {["Product", "Qty", "Unit Price", "Item Total"].map((h) => (
                                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, idx) => (
                                <tr key={idx} style={{ borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                                  <td style={{ padding: "8px 12px", fontSize: "12px", color: "#0B1F3A" }}>{item.productName}</td>
                                  <td style={{ padding: "8px 12px", fontSize: "12px", color: "#6E6E73" }}>{item.quantity}</td>
                                  <td style={{ padding: "8px 12px", fontSize: "12px", color: "#6E6E73" }}>{formatCurrency(item.unitPrice)}</td>
                                  <td style={{ padding: "8px 12px", fontSize: "12px", fontWeight: 600, color: "#0B1F3A" }}>{formatCurrency(item.totalPrice)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}

                    {/* Refund inline panel */}
                    {hasRefundPanel && (
                      <tr style={{ background: "#fef2f2", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                        <td colSpan={colSpan} style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                            <textarea
                              value={refundReason[order.id] || ""}
                              onChange={(e) => setRefundReason((p) => ({ ...p, [order.id]: e.target.value }))}
                              placeholder="Reason for refund (optional)"
                              rows={2}
                              style={{ flex: 1, padding: "10px 14px", fontSize: "13px", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "10px", outline: "none", resize: "vertical" }}
                            />
                            <button
                              onClick={() => handleRefund(order.id)}
                              disabled={refunding === order.id}
                              style={{ padding: "10px 20px", borderRadius: "999px", background: "#dc2626", color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, flexShrink: 0, opacity: refunding === order.id ? 0.6 : 1 }}>
                              {refunding === order.id ? "Processing..." : "Confirm Refund"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
