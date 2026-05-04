"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Product } from "@/types/product";
import { Order } from "@/types/order";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { formatCurrency } from "@/lib/utils";
import KpiCard from "@/components/admin/KpiCard";
import BookingTrendChart from "@/components/admin/BookingTrendChart";
import ProductPerformanceChart from "@/components/admin/ProductPerformanceChart";
import CategoryBreakdownChart from "@/components/admin/CategoryBreakdownChart";
import StatusDistributionChart from "@/components/admin/StatusDistributionChart";
import RevenueBreakdownChart from "@/components/admin/RevenueBreakdownChart";
import { IndianRupee, ClipboardList, TrendingUp, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { dateRange, setDateRange } = useAnalyticsStore();

  const fetchData = useCallback(async () => {
    const [prodRes, orderRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/orders"),
    ]);
    setProducts(await prodRes.json());
    setOrders(await orderRes.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter orders by date range
  const days = Number(dateRange);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const filteredOrders = orders.filter(
    (o) => new Date(o.createdAt) >= cutoffDate
  );

  // KPI calculations — net revenue excludes refunded orders
  const netRevenue = filteredOrders
    .filter((o) => (o.paymentStatus === "paid" || (!o.paymentStatus && !!o.paymentId)) && (o.paymentStatus as string) !== "refunded")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const refundedAmount = filteredOrders
    .filter((o) => o.paymentStatus === "refunded")
    .reduce((sum, o) => sum + (o.amountPaid ? o.amountPaid / 100 : o.totalAmount || 0), 0);

  const grossRevenue = netRevenue + refundedAmount;
  const totalRevenue = netRevenue; // alias for avg calc

  const avgOrderValue =
    filteredOrders.length > 0 ? Math.round(netRevenue / filteredOrders.length) : 0;

  // Top category — still uses products for category lookup
  const categoryCounts = filteredOrders.reduce((acc, o) => {
    const product = products.find((p) => p.id === o.productId);
    if (product) {
      acc[product.category] = (acc[product.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "N/A";

  const rangeOptions = [
    { value: "7", label: "Last 7 Days" },
    { value: "30", label: "Last 30 Days" },
    { value: "90", label: "Last 90 Days" },
  ] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.1 }}>Analytics</h1>
          <p style={{ fontSize: "14px", color: "#6E6E73", marginTop: "6px" }}>Business insights and performance metrics</p>
        </div>

        {/* Date Range Selector */}
        <div style={{ display: "flex", gap: "4px", background: "white", borderRadius: "14px", padding: "4px", border: "1px solid rgba(0,0,0,0.06)", flexShrink: 0 }}>
          {rangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              style={{
                padding: "10px 18px", borderRadius: "10px", fontSize: "12px", fontWeight: 500,
                border: "none", cursor: "pointer", transition: "all 0.2s",
                background: dateRange === opt.value ? "#0B1F3A" : "transparent",
                color: dateRange === opt.value ? "white" : "#6E6E73",
              }}
              aria-label={`Show data for ${opt.label}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <KpiCard title="Revenue" value={formatCurrency(netRevenue)} icon={IndianRupee} accentColor="bg-emerald-100 text-emerald-600" rawAmount={netRevenue} subtitle={refundedAmount > 0 ? `Gross: ${formatCurrency(grossRevenue)} | Refunded: ${formatCurrency(refundedAmount)}` : undefined} />
        <KpiCard title="Total Bookings" value={filteredOrders.length} icon={ClipboardList} />
        <KpiCard title="Avg Order Value" value={formatCurrency(avgOrderValue)} icon={TrendingUp} accentColor="bg-blue-100 text-blue-600" rawAmount={avgOrderValue} />
        <KpiCard title="Top Category" value={topCategory} icon={Tag} accentColor="bg-purple-100 text-purple-600" />
      </div>

      {/* Booking trend — full width */}
      <BookingTrendChart orders={filteredOrders} days={days} />

      {/* Side by side charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <ProductPerformanceChart products={products} orders={filteredOrders} />
        <CategoryBreakdownChart products={products} orders={filteredOrders} />
      </div>

      {/* Status distribution — full width */}
      <StatusDistributionChart orders={filteredOrders} />

      {/* Revenue breakdown — full width */}
      <RevenueBreakdownChart orders={filteredOrders} />
    </div>
  );
}
