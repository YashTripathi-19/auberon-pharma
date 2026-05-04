"use client";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Order } from "@/types/order";

export default function SalesChart({ orders }: { orders: Order[] }) {
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    const dayOrders = orders.filter((o) => o.createdAt.split("T")[0] === dateStr);
    return {
      date: date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
      bookings: dayOrders.length,
    };
  });

  return (
    <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "32px 36px" }}>
      <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: "#0B1F3A", marginBottom: "24px" }}>Bookings — Last 7 Days</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9963E" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#C9963E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6E6E73" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6E6E73" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E5EA", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", fontSize: "12px" }} />
            <Area type="monotone" dataKey="bookings" stroke="#C9963E" strokeWidth={2} fill="url(#grad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
