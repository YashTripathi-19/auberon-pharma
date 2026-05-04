"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Order } from "@/types/order";
import { formatCurrency, formatCurrencyFull } from "@/lib/utils";

interface Props { orders: Order[] }

export default function RevenueBreakdownChart({ orders }: Props) {
  const netRevenue = orders
    .filter((o) => (o.paymentStatus === "paid" || (!o.paymentStatus && !!o.paymentId)) && o.paymentStatus !== "refunded")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const refundedAmount = orders
    .filter((o) => o.paymentStatus === "refunded")
    .reduce((sum, o) => sum + (o.amountPaid ? o.amountPaid / 100 : o.totalAmount || 0), 0);

  const pendingAmount = orders
    .filter((o) => !o.paymentStatus || o.paymentStatus === "pending")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const totalDiscountsGiven = orders
    .filter((o) => o.discountAmount && o.discountAmount > 0)
    .reduce((sum, o) => sum + (o.discountAmount || 0), 0);

  const grossRevenue = netRevenue + refundedAmount;

  const data = [
    { name: "Net Revenue", value: netRevenue, color: "#16a34a" },
    { name: "Refunded", value: refundedAmount, color: "#dc2626" },
    { name: "Pending Payment", value: pendingAmount, color: "#f59e0b" },
    { name: "Discounts Given", value: totalDiscountsGiven, color: "#f97316" },
  ].filter((d) => d.value > 0);

  const hasData = data.length > 0;

  return (
    <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "32px 36px" }}>
      <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: "#0B1F3A", marginBottom: "24px" }}>Revenue Breakdown</p>

      {!hasData ? (
        <p style={{ fontSize: "13px", color: "#6E6E73", textAlign: "center", padding: "48px 0" }}>No revenue data yet</p>
      ) : (
        <>
          <div style={{ height: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrencyFull(value), name]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #f0f0f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stat chips */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px", justifyContent: "center" }}>
            <div style={{ padding: "8px 16px", borderRadius: "999px", background: "#fef9ec", border: "1px solid #f0d9a0" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#92400e" }}>Gross Revenue: </span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#c9933a" }}>{formatCurrency(grossRevenue)}</span>
            </div>
            <div style={{ padding: "8px 16px", borderRadius: "999px", background: "#fef2f2", border: "1px solid #fecaca" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#991b1b" }}>Total Refunded: </span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#dc2626" }}>{formatCurrency(refundedAmount)}</span>
            </div>
            <div style={{ padding: "8px 16px", borderRadius: "999px", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#14532d" }}>Net Revenue: </span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a" }}>{formatCurrency(netRevenue)}</span>
            </div>
            {totalDiscountsGiven > 0 && (
              <div style={{ padding: "8px 16px", borderRadius: "999px", background: "#fff7ed", border: "1px solid #fed7aa" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#9a3412" }}>Total Discounts: </span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#f97316" }}>{formatCurrency(totalDiscountsGiven)}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
