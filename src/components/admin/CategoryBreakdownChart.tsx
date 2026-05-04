"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Order } from "@/types/order";
import { Product } from "@/types/product";

interface CategoryBreakdownChartProps {
  products: Product[];
  orders: Order[];
}

const CATEGORY_COLORS = [
  "#1a2744", // navy
  "#c9933a", // gold
  "#0d9488", // teal
  "#dc2626", // red
  "#f59e0b", // amber
  "#16a34a", // green
  "#7c3aed", // purple
];

export default function CategoryBreakdownChart({ products, orders }: CategoryBreakdownChartProps) {
  // Build productId → category map
  const productCategoryMap = new Map(products.map((p) => [p.id, p.category]));

  // Group orders by category dynamically
  const categoryCount: Record<string, number> = {};
  for (const order of orders) {
    const orderItems = order.items?.length
      ? order.items
      : [{ productId: order.productId, quantity: order.quantity || 1 }];

    for (const item of orderItems) {
      const cat = productCategoryMap.get(item.productId) || "Unknown";
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }
  }

  const data = Object.entries(categoryCount)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Fallback: if no orders, show product count per category
  const displayData = data.length > 0
    ? data
    : Array.from(new Set(products.map((p) => p.category))).map((cat) => ({
        name: cat,
        value: products.filter((p) => p.category === cat).length,
      }));

  if (displayData.length === 0) {
    return (
      <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "32px 36px" }}>
        <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: "#0B1F3A", marginBottom: "24px" }}>Category Breakdown</p>
        <p style={{ fontSize: "13px", color: "#6E6E73", textAlign: "center", padding: "48px 0" }}>No order data yet</p>
      </div>
    );
  }

  return (
    <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "32px 36px" }}>
      <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: "#0B1F3A", marginBottom: "24px" }}>Category Breakdown</p>
      <div style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={displayData} cx="50%" cy="45%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
              {displayData.map((_, index) => (
                <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown, name: unknown) => {
                const v = value as number;
                return [`${v} orders`, name as string];
              }}
              contentStyle={{ borderRadius: "12px", border: "1px solid #f0f0f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: "16px" }}
              formatter={(value) => <span style={{ color: "#6B7280", fontSize: "12px" }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
