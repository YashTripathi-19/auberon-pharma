import { getOrders, getUsers } from "@/lib/db";

export type Period = "quarter" | "year" | "alltime";
export type CustomerRole = "customer" | "wholesaler" | "clinic";

export interface TopCustomer {
  userId: string;
  name: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string;
}

export function getTopCustomersByRole(role: CustomerRole, period: Period): TopCustomer[] {
  const now = Date.now();
  const cutoff = period === "quarter" ? now - 90 * 86400000
    : period === "year" ? now - 365 * 86400000
    : 0;

  const orders = getOrders().filter((o) => {
    if (!["delivered", "confirmed"].includes(o.status)) return false;
    if (o.paymentStatus === "refunded") return false;
    if (cutoff && new Date(o.createdAt).getTime() < cutoff) return false;
    return true;
  });

  const users = getUsers().filter((u) => u.role === role);
  const userMap = new Map(users.map((u) => [u.id, u.name]));

  const grouped: Record<string, { totalSpend: number; totalOrders: number; lastOrderDate: string }> = {};

  for (const o of orders) {
    if (!o.userId || !userMap.has(o.userId)) continue;
    const spend = o.totalAmount || 0;
    if (!grouped[o.userId]) grouped[o.userId] = { totalSpend: 0, totalOrders: 0, lastOrderDate: o.createdAt };
    grouped[o.userId].totalSpend += spend;
    grouped[o.userId].totalOrders += 1;
    if (o.createdAt > grouped[o.userId].lastOrderDate) grouped[o.userId].lastOrderDate = o.createdAt;
  }

  return Object.entries(grouped)
    .map(([userId, data]) => ({ userId, name: userMap.get(userId) || "Unknown", ...data }))
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 5);
}
