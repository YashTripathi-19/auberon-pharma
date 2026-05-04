"use client";
import React, { useEffect, useState, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import { User, Truck, Stethoscope } from "lucide-react";

type Period = "quarter" | "year" | "alltime";
type CustomerRole = "customer" | "wholesaler" | "clinic";

interface TopCustomer {
  userId: string; name: string; totalOrders: number; totalSpend: number; lastOrderDate: string;
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "quarter", label: "This Quarter" },
  { key: "year", label: "This Year" },
  { key: "alltime", label: "All Time" },
];

const COLUMNS: { role: CustomerRole; label: string; icon: React.ReactNode }[] = [
  { role: "customer", label: "Top Customers", icon: <User size={15} strokeWidth={1.5} /> },
  { role: "wholesaler", label: "Top Wholesalers", icon: <Truck size={15} strokeWidth={1.5} /> },
  { role: "clinic", label: "Top Clinics", icon: <Stethoscope size={15} strokeWidth={1.5} /> },
];

function LeaderboardColumn({ role, label, icon, period }: { role: CustomerRole; label: string; icon: React.ReactNode; period: Period }) {
  const [data, setData] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/top-customers?role=${role}&period=${period}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setData)
      .finally(() => setLoading(false));
  }, [role, period]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return (
    <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <span style={{ color: "#6E6E73" }}>{icon}</span>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#0B1F3A" }}>{label}</p>
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map((i) => <div key={i} className="animate-pulse bg-gray-100 rounded" style={{ height: "14px" }} />)}
        </div>
      ) : data.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#9CA3AF", textAlign: "center", padding: "24px 0" }}>No orders yet</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {data.map((c, i) => (
            <div key={c.userId} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: i < data.length - 1 ? "1px solid #f0f0f0" : "none" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: i === 0 ? "#C9963E" : "#9CA3AF", width: "18px", flexShrink: 0 }}>
                {i === 0 ? "★" : `${i + 1}`}
              </span>
              <span style={{ flex: 1, fontSize: "13px", fontWeight: 500, color: i === 0 ? "#C9963E" : "#0B1F3A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.name}
              </span>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#0B1F3A" }}>{c.totalSpend > 0 ? formatCurrency(c.totalSpend) : `${c.totalOrders} orders`}</p>
                <p style={{ fontSize: "10px", color: "#9CA3AF" }}>{c.totalOrders} order{c.totalOrders !== 1 ? "s" : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopCustomersPanel() {
  const [period, setPeriod] = useState<Period>("quarter");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.15rem", fontWeight: 700, color: "#0B1F3A" }}>Top Customers</p>
        <div style={{ display: "flex", gap: "4px", background: "white", borderRadius: "14px", padding: "4px", border: "1px solid rgba(0,0,0,0.06)" }}>
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              style={{ padding: "8px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 500, border: "none", cursor: "pointer", transition: "all 0.2s", background: period === p.key ? "#0B1F3A" : "transparent", color: period === p.key ? "white" : "#6E6E73" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <LeaderboardColumn key={col.role} {...col} period={period} />
        ))}
      </div>
    </div>
  );
}
