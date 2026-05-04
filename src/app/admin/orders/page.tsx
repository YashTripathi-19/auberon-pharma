"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Order } from "@/types/order";
import OrdersTable from "@/components/admin/OrdersTable";
import Badge from "@/components/ui/Badge";
import { csvExport } from "@/lib/utils";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

const statusTabs = ["all", "pending", "confirmed", "dispatched", "delivered", "rejected", "expired"];
const statusVariants: Record<string, "default" | "warning" | "info" | "success" | "danger"> = {
  pending: "warning",
  confirmed: "info",
  dispatched: "default",
  delivered: "success",
  rejected: "danger",
  expired: "default",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered =
    activeTab === "all"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  const statusCounts = statusTabs.reduce((acc, s) => {
    acc[s] = s === "all" ? orders.length : orders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const handleOrderUpdate = (id: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, ...updates } : o));
  };
  const handleExportCSV = () => {
    const headers = [
      "Order ID", "Customer", "Phone", "Email", "Items", "Total", "Address", "Status", "Payment", "Date",
    ];
    const rows = filtered.map((o) => [
      o.id,
      o.customerName,
      o.customerPhone,
      o.customerEmail,
      o.items ? o.items.map((i) => `${i.productName} x${i.quantity}`).join("; ") : o.productName,
      String(o.totalAmount || 0),
      o.deliveryAddress,
      o.status,
      o.paymentStatus || "pending",
      o.createdAt,
    ]);
    csvExport(headers, rows, `orders-${activeTab}-${Date.now()}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.1 }}>Orders</h1>
          <p style={{ fontSize: "14px", color: "#6E6E73", marginTop: "6px" }}>Manage and track customer orders</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-primary btn-navy"
          style={{ fontSize: "13px", padding: "12px 24px", flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}
          aria-label="Export orders as CSV"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {statusTabs.map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            style={{
              padding: "10px 20px", borderRadius: "999px", fontSize: "13px", fontWeight: 500,
              display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
              border: activeTab === status ? "none" : "1px solid rgba(0,0,0,0.08)",
              background: activeTab === status ? "#0B1F3A" : "white",
              color: activeTab === status ? "white" : "#6E6E73",
              transition: "all 0.2s",
            }}
            aria-label={`Filter by ${status}`}
          >
            <span style={{ textTransform: "capitalize" }}>{status}</span>
            <span style={{
              fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px",
              background: activeTab === status ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.06)",
              color: activeTab === status ? "white" : "#6E6E73",
            }}>
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <OrdersTable orders={filtered} onOrderUpdate={handleOrderUpdate} />
      </div>
    </div>
  );
}
