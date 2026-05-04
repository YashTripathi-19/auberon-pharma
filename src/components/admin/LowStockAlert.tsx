import React from "react";
import { Product } from "@/types/product";
import { AlertTriangle } from "lucide-react";

export default function LowStockAlert({ products }: { products: Product[] }) {
  const low = products.filter((p) => p.stock < 20 && p.isActive);
  if (low.length === 0) return null;

  return (
    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "20px", padding: "28px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <AlertTriangle size={16} className="text-amber-500" strokeWidth={1.5} />
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#92400e" }}>
          {low.length} product{low.length > 1 ? "s" : ""} running low on stock
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
        {low.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", borderRadius: "14px", padding: "14px 18px", border: "1px solid #fde68a" }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#0B1F3A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
              <p style={{ fontSize: "11px", color: "#6E6E73", marginTop: "2px" }}>{p.category}</p>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444", flexShrink: 0, marginLeft: "12px" }}>{p.stock} left</span>
          </div>
        ))}
      </div>
    </div>
  );
}
