import { getProducts, getOrders, getContacts, getUsers } from "@/lib/db";

export interface ReportData {
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;

  revenue: {
    last24h: number;
    allTime: number;
    previous24h: number;
    pendingPayment24h: number;
    grossRevenue24h: number;
    netRevenue24h: number;
    totalRefunded24h: number;
    refundCount24h: number;
    totalDiscountsGiven24h: number;
    changePercent: number;
    changeDirection: "up" | "down" | "flat";
  };

  orders: {
    last24h: number;
    byStatus: Record<string, number>;
    list: Array<{
      id: string; customerName: string; productName: string;
      quantity: number; amount: number; status: string; createdAt: Date;
    }>;
    pendingOld: Array<{
      id: string; customerName: string; productName: string;
      quantity: number; createdAt: Date; elapsedMinutes: number;
    }>;
    expired24h: number;
    expiredStockReverted: number;
  };

  products: {
    top5: Array<{ name: string; unitsSold: number; revenue: number }>;
    lowStock: Array<{ name: string; stock: number; critical: boolean }>;
    zeroStock: string[];
  };

  customers: {
    newSignups24h: number;
    newUsers: Array<{ name: string; email: string }>;
  };

  contacts: {
    new24h: number;
    unread: number;
    list: Array<{ name: string; subject: string; isRead: boolean }>;
  };

  executiveSummary: string[];
  categoryBreakdown: Record<string, { orders: number; revenue: number }>;
}

export function generateReportData(): ReportData {
  const now = new Date();
  const periodEnd = now;
  const periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const prev24Start = new Date(periodStart.getTime() - 24 * 60 * 60 * 1000);

  const products = getProducts();
  const orders = getOrders();
  const contacts = getContacts();
  const users = getUsers();

  const priceMap: Record<string, number> = {};
  for (const p of products) priceMap[p.id] = p.price;

  // Revenue helpers — net revenue excludes refunded orders
  const calcNetRevenue = (orderList: typeof orders) =>
    orderList
      .filter((o) => o.paymentStatus === "paid" || (!o.paymentStatus && !!o.paymentId))
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const calcRefundedAmount = (orderList: typeof orders) =>
    orderList
      .filter((o) => o.paymentStatus === "refunded")
      .reduce((sum, o) => sum + (o.amountPaid ? o.amountPaid / 100 : o.totalAmount || 0), 0);

  const calcPendingRevenue = (orderList: typeof orders) =>
    orderList.filter((o) => !o.paymentStatus || o.paymentStatus === "pending").reduce((sum, o) => {
      if (o.totalAmount) return sum + o.totalAmount;
      return sum + (priceMap[o.productId] || 0) * (o.quantity || 1);
    }, 0);

  const orders24h = orders.filter((o) => new Date(o.createdAt) >= periodStart);
  const ordersPrev24h = orders.filter(
    (o) => new Date(o.createdAt) >= prev24Start && new Date(o.createdAt) < periodStart
  );

  const rev24h = calcNetRevenue(orders24h);
  const revPrev24h = calcNetRevenue(ordersPrev24h);
  const revAllTime = calcNetRevenue(orders);
  const pendingPayment24h = calcPendingRevenue(orders24h);
  const refunded24h = calcRefundedAmount(orders24h);
  const refundCount24h = orders24h.filter((o) => o.paymentStatus === "refunded").length;
  const grossRevenue24h = rev24h + refunded24h;
  const totalDiscountsGiven24h = orders24h.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
  const changePercent = revPrev24h === 0
    ? (rev24h > 0 ? 100 : 0)
    : Math.round(((rev24h - revPrev24h) / revPrev24h) * 100);

  // Orders by status
  const statuses = ["pending", "confirmed", "dispatched", "delivered", "rejected", "expired"];
  const byStatus: Record<string, number> = {};
  for (const s of statuses) byStatus[s] = orders24h.filter((o) => o.status === s).length;

  // Order list for report
  const orderList = orders24h.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    productName: o.items && o.items.length > 1 ? `${o.items.length} items` : (o.items?.[0]?.productName || o.productName),
    quantity: o.items ? o.items.reduce((s, i) => s + i.quantity, 0) : (o.quantity || 1),
    amount: o.totalAmount || (priceMap[o.productId] || 0) * (o.quantity || 1),
    status: o.status,
    createdAt: new Date(o.createdAt),
  }));

  // Pending orders older than 1 hour
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const pendingOld = orders
    .filter((o) => o.status === "pending" && new Date(o.createdAt) < oneHourAgo)
    .map((o) => ({
      id: o.id,
      customerName: o.customerName,
      productName: o.items && o.items.length > 1 ? `${o.items.length} items` : (o.items?.[0]?.productName || o.productName),
      quantity: o.items ? o.items.reduce((s, i) => s + i.quantity, 0) : (o.quantity || 1),
      createdAt: new Date(o.createdAt),
      elapsedMinutes: Math.floor((now.getTime() - new Date(o.createdAt).getTime()) / 60000),
    }));

  // Expired in last 24h
  const expired24h = orders24h.filter((o) => o.status === "expired");
  const expiredStockReverted = expired24h.reduce((sum, o) => sum + o.quantity, 0);

  // Top 5 products by units sold in last 24h
  const soldMap: Record<string, { name: string; units: number; revenue: number }> = {};
  for (const o of orders24h) {
    if (o.items && o.items.length > 0) {
      for (const item of o.items) {
        if (!soldMap[item.productId]) soldMap[item.productId] = { name: item.productName, units: 0, revenue: 0 };
        soldMap[item.productId].units += item.quantity;
        soldMap[item.productId].revenue += item.totalPrice;
      }
    } else {
      if (!soldMap[o.productId]) soldMap[o.productId] = { name: o.productName, units: 0, revenue: 0 };
      soldMap[o.productId].units += o.quantity || 1;
      soldMap[o.productId].revenue += (priceMap[o.productId] || 0) * (o.quantity || 1);
    }
  }
  const top5 = Object.values(soldMap)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5)
    .map((p) => ({ name: p.name, unitsSold: p.units, revenue: p.revenue }));

  // Low stock
  const lowStock = products
    .filter((p) => p.isActive && p.stock < 20)
    .map((p) => ({ name: p.name, stock: p.stock, critical: p.stock < 5 }));
  const zeroStock = products.filter((p) => p.isActive && p.stock === 0).map((p) => p.name);

  // New users in last 24h
  const newUsers = users.filter((u) => new Date(u.createdAt) >= periodStart);

  // Contacts in last 24h
  const newContacts = contacts.filter((c) => new Date(c.createdAt) >= periodStart);
  const unreadContacts = contacts.filter((c) => !c.isRead).length;

  const fmtRs = (n: number) =>
    `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)}`;

  const changeSign = changePercent > 0 ? "+" : changePercent < 0 ? "-" : "";
  const absChange = Math.abs(changePercent);

  const summary: string[] = [];

  summary.push(
    `Revenue for the last 24 hours was ${fmtRs(rev24h)}, a ${changeSign}${absChange}% change compared to the previous day.`
  );

  const pendingCount = byStatus["pending"] || 0;
  summary.push(
    `${orders24h.length} new order(s) were placed in the last 24 hours, with ${pendingCount} currently pending action.`
  );

  if (top5.length > 0) {
    summary.push(
      `${top5[0].name} was the best-selling product with ${top5[0].unitsSold} unit(s) sold.`
    );
  }

  if (pendingOld.length > 0) {
    summary.push(
      `${pendingOld.length} order(s) have been pending for over 1 hour and require immediate attention.`
    );
  }

  if (lowStock.length > 0) {
    summary.push(
      `${lowStock.length} product(s) are running low on stock - replenishment recommended soon.`
    );
  }

  if (zeroStock.length > 0) {
    summary.push(
      `${zeroStock[0]} is completely out of stock and cannot accept new orders.`
    );
  }

  if (newUsers.length > 0) {
    summary.push(
      `${newUsers.length} new customer(s) signed up in the last 24 hours.`
    );
  }

  if (newContacts.length > 0) {
    summary.push(
      `${newContacts.length} new customer inquiry/inquiries received - ${unreadContacts} unread.`
    );
  }

  if (expired24h.length > 0) {
    summary.push(
      `${expired24h.length} order(s) auto-expired and stock was automatically restored.`
    );
  }

  // Closing health bullet — always last
  if (pendingOld.length > 2 || lowStock.length > 2) {
    summary.push("Overall business activity requires attention today.");
  } else if (rev24h > revPrev24h && pendingOld.length <= 1) {
    summary.push("Business is performing well - revenue is up and operations are stable.");
  } else {
    summary.push("Operations are running normally with no critical issues flagged.");
  }

  // Dynamic category breakdown
  const categoryBreakdown: Record<string, { orders: number; revenue: number }> = {};
  for (const o of orders) {
    const orderItems = o.items?.length
      ? o.items
      : [{ productId: o.productId, quantity: o.quantity || 1, totalPrice: o.totalAmount || 0 }];
    for (const item of orderItems) {
      const product = products.find((p) => p.id === item.productId);
      const cat = product?.category || "Unknown";
      if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { orders: 0, revenue: 0 };
      categoryBreakdown[cat].orders += 1;
      categoryBreakdown[cat].revenue += (item as { totalPrice?: number }).totalPrice || 0;
    }
  }

  return {
    generatedAt: now,
    periodStart,
    periodEnd,
    revenue: {
      last24h: rev24h,
      allTime: revAllTime,
      previous24h: revPrev24h,
      pendingPayment24h,
      grossRevenue24h,
      netRevenue24h: rev24h,
      totalRefunded24h: refunded24h,
      refundCount24h,
      totalDiscountsGiven24h,
      changePercent: Math.abs(changePercent),
      changeDirection: changePercent > 0 ? "up" : changePercent < 0 ? "down" : "flat",
    },
    orders: {
      last24h: orders24h.length,
      byStatus,
      list: orderList,
      pendingOld,
      expired24h: expired24h.length,
      expiredStockReverted,
    },
    products: { top5, lowStock, zeroStock },
    customers: {
      newSignups24h: newUsers.length,
      newUsers: newUsers.map((u) => ({ name: u.name, email: u.email })),
    },
    contacts: {
      new24h: newContacts.length,
      unread: unreadContacts,
      list: newContacts.map((c) => ({ name: c.name, subject: c.subject, isRead: c.isRead })),
    },
    executiveSummary: summary.slice(0, 10),
    categoryBreakdown,
  };
}
