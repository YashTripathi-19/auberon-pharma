import React from "react";
import { Order } from "@/types/order";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  confirmed: "bg-blue-50 text-blue-600",
  dispatched: "bg-gray-100 text-gray-600",
  delivered: "bg-emerald-50 text-emerald-600",
};

export default function ActivityFeed({ orders }: { orders: Order[] }) {
  const recent = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

  return (
    <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "32px 36px" }}>
      <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: "#0B1F3A", marginBottom: "24px" }}>Recent Activity</p>
      {recent.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#6E6E73", textAlign: "center", padding: "40px 0" }}>No recent orders</p>
      ) : (
        <div>
          {recent.map((order, i) => (
            <div key={order.id} style={{
              display: "flex", alignItems: "center", gap: "16px",
              padding: "14px 16px", borderRadius: "12px",
              borderBottom: i < recent.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
            }}
              className="hover:bg-[#F5F5F7] transition-colors"
            >
              <div style={{ width: "38px", height: "38px", background: "rgba(11,31,58,0.05)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#0B1F3A" }}>{order.customerName.charAt(0).toUpperCase()}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "#0B1F3A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.customerName}</p>
                <p style={{ fontSize: "11px", color: "#6E6E73", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
                  {order.items && order.items.length > 1
                    ? `${order.items.length} items — ${order.totalAmount ? `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(order.totalAmount)}` : ""}`
                    : `${order.items?.[0]?.productName || order.productName} × ${order.items?.[0]?.quantity || order.quantity}`
                  }
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span className={cn("text-[11px] font-semibold px-3 py-1.5 rounded-full capitalize", statusStyle[order.status] || "bg-gray-100 text-gray-600")}>
                  {order.status}
                </span>
                <p style={{ fontSize: "10px", color: "#6E6E73", marginTop: "4px" }}>{formatDate(order.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
