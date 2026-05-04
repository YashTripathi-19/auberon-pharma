import React from "react";
import { Product } from "@/types/product";
import { Order } from "@/types/order";

export default function TopProductsTable({ products, orders }: { products: Product[]; orders: Order[] }) {
  const ranked = products
    .map((p) => ({
      ...p,
      orderCount: orders.filter((o) => o.productId === p.id).length,
      totalQty: orders.filter((o) => o.productId === p.id).reduce((s, o) => s + o.quantity, 0),
    }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5);

  return (
    <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "32px 36px" }}>
      <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: "#0B1F3A", marginBottom: "24px" }}>Top Products</p>
      {ranked.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#6E6E73", textAlign: "center", padding: "40px 0" }}>No order data yet</p>
      ) : (
        <div>
          {ranked.map((p, i) => (
            <div key={p.id} className="flex items-center gap-4 hover:bg-[#F5F5F7] transition-colors rounded-xl" style={{ padding: "14px 16px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#6E6E73", width: "20px", flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "#0B1F3A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                <p style={{ fontSize: "11px", color: "#6E6E73", marginTop: "2px" }}>{p.category}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#0B1F3A" }}>{p.orderCount} orders</p>
                <p style={{ fontSize: "11px", color: "#6E6E73", marginTop: "2px" }}>{p.totalQty} units</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
