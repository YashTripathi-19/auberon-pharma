"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Order } from "@/types/order";

interface BookingTrendChartProps {
  orders: Order[];
  days: number;
}

export default function BookingTrendChart({ orders, days }: BookingTrendChartProps) {
  const data = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split("T")[0];
    const dayOrders = orders.filter((o) => o.createdAt.split("T")[0] === dateStr);

    const active = dayOrders.filter((o) =>
      ["confirmed", "dispatched", "delivered"].includes(o.status)
    ).length;

    const cancelled = dayOrders.filter((o) =>
      o.status === "rejected" || o.status === "expired"
    ).length;

    return {
      date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      active,
      cancelled,
    };
  });

  return (
    <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "32px 36px" }}>
      <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: "#0B1F3A", marginBottom: "24px" }}>Booking Trends</p>
      <div style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #f0f0f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: "12px" }}
              formatter={(value) => <span style={{ color: "#6B7280", fontSize: "12px" }}>{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="active"
              name="Active Orders"
              stroke="#c9933a"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="cancelled"
              name="Cancelled / Expired"
              stroke="#dc2626"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
