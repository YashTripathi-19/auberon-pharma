"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Order } from "@/types/order";

const STATUS_COLORS: Record<string, string> = {
  confirmed:  "#c9933a",
  delivered:  "#16a34a",
  dispatched: "#2563eb",
  pending:    "#f59e0b",
  rejected:   "#dc2626",
  expired:    "#6b7280",
  refunded:   "#7c3aed",
};

const ALL_STATUSES = ["pending", "confirmed", "dispatched", "delivered", "rejected", "expired", "refunded"];

interface Props { orders: Order[] }

export default function StatusDistributionChart({ orders }: Props) {
  // Count refunded as a separate "status" bucket
  const data = ALL_STATUSES.map((s) => {
    const count = s === "refunded"
      ? orders.filter((o) => o.paymentStatus === "refunded").length
      : orders.filter((o) => o.status === s && o.paymentStatus !== "refunded").length;
    return {
      name: s.charAt(0).toUpperCase() + s.slice(1),
      key: s,
      value: count,
    };
  });

  const hasData = data.some((d) => d.value > 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: {
    cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; value: number; name: string;
  }) => {
    if (value === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>
        {value}
      </text>
    );
  };

  return (
    <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "32px 36px" }}>
      <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: "#0B1F3A", marginBottom: "24px" }}>Order Status Distribution</p>

      {!hasData ? (
        <p style={{ fontSize: "13px", color: "#6E6E73", textAlign: "center", padding: "48px 0" }}>No order data yet</p>
      ) : (
        <div style={{ height: "320px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="42%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={renderLabel}
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} opacity={entry.value === 0 ? 0.2 : 1} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value} orders`, name]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #f0f0f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: "16px" }}
                payload={ALL_STATUSES.map((s) => ({
                  value: `${s.charAt(0).toUpperCase() + s.slice(1)} (${data.find((d) => d.key === s)?.value ?? 0})`,
                  type: "circle" as const,
                  color: STATUS_COLORS[s],
                }))}
                formatter={(value) => <span style={{ color: "#6B7280", fontSize: "11px" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
