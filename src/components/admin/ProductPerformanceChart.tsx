"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Product } from "@/types/product";
import { Order } from "@/types/order";

interface ProductPerformanceChartProps {
  products: Product[];
  orders: Order[];
}

export default function ProductPerformanceChart({
  products,
  orders,
}: ProductPerformanceChartProps) {
  const data = products
    .map((p) => ({
      name: p.name.length > 20 ? p.name.substring(0, 20) + "…" : p.name,
      orders: orders.filter((o) => o.productId === p.id).length,
    }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 8);

  return (
    <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "32px 36px" }}>
      <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: "#0B1F3A", marginBottom: "24px" }}>Product Performance</p>
      <div style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#6B7280" }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              width={140}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #f0f0f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Bar dataKey="orders" fill="#C9963E" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
