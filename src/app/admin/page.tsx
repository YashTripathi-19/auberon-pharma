import { getProducts } from "@/lib/db";
import { getOrders } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import KpiCard from "@/components/admin/KpiCard";
import SalesChart from "@/components/admin/SalesChart";
import TopProductsTable from "@/components/admin/TopProductsTable";
import ActivityFeed from "@/components/admin/ActivityFeed";
import LowStockAlert from "@/components/admin/LowStockAlert";
import ExpireOrdersTrigger from "@/components/admin/ExpireOrdersTrigger";
import SendReportButton from "@/components/admin/SendReportButton";
import SubscribersKpiCard from "@/components/admin/SubscribersKpiCard";
import BusinessKpiCard from "@/components/admin/BusinessKpiCard";
import TopCustomersPanel from "@/components/admin/TopCustomersPanel";
import {
  ClipboardList,
  CalendarCheck,
  IndianRupee,
  Package,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboard() {
  const products = getProducts();
  const orders = getOrders();
  const activeProducts = products.filter((p) => p.isActive);
  const lowStockCount = activeProducts.filter((p) => p.stock < 20).length;

  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter(
    (o) => o.createdAt.split("T")[0] === today
  );

  const netRevenue = orders
    .filter((o) => (o.paymentStatus === "paid" || (!o.paymentStatus && !!o.paymentId)) && o.paymentStatus !== "refunded")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const refundedAmount = orders
    .filter((o) => o.paymentStatus === "refunded")
    .reduce((sum, o) => sum + (o.amountPaid ? o.amountPaid / 100 : o.totalAmount || 0), 0);

  const refundCount = orders.filter((o) => o.paymentStatus === "refunded").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Triggers 24hr order expiry check on every dashboard mount */}
      <ExpireOrdersTrigger />

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.1 }}>Dashboard</h1>
          <p style={{ fontSize: "14px", color: "#6E6E73", marginTop: "6px" }}>Welcome back. Here&apos;s your business overview.</p>
        </div>
        <SendReportButton />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard title="Total Orders" value={orders.length} icon={ClipboardList} subtitle={`${orders.filter((o) => o.status === "pending").length} pending`} />
        <KpiCard title="Orders Today" value={todayOrders.length} icon={CalendarCheck} accentColor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Est. Revenue" value={formatCurrency(netRevenue)} icon={IndianRupee} accentColor="bg-blue-50 text-blue-600" rawAmount={netRevenue} subtitle={refundCount > 0 ? `- ${formatCurrency(refundedAmount)} refunded` : undefined} />
        <KpiCard title="Active Products" value={activeProducts.length} icon={Package} accentColor="bg-violet-50 text-violet-600" />
        <KpiCard title="Low Stock" value={lowStockCount} icon={AlertTriangle} accentColor={lowStockCount > 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"} />
        <SubscribersKpiCard />
        <BusinessKpiCard />
      </div>

      <LowStockAlert products={products} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <SalesChart orders={orders} />
        <TopProductsTable products={products} orders={orders} />
      </div>

      <ActivityFeed orders={orders} />

      <TopCustomersPanel />
    </div>
  );
}
