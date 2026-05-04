export type OrderStatus = "pending" | "confirmed" | "dispatched" | "delivered" | "rejected" | "expired";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  // New consolidated format
  items: OrderItem[];
  totalAmount: number;
  // Legacy flat fields — kept for backward compat, populated by normalisation in db.ts
  productId: string;
  productName: string;
  quantity: number;
  // Customer
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  notes: string;
  // Status
  status: OrderStatus;
  userId?: string;
  createdAt: string;
  // Payment
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentId: string | null;
  razorpayOrderId: string | null;
  amountPaid: number | null;
  paymentMethod: string | null;
  // Discounts
  discountAmount: number | null;
  couponCode: string | null;
  roleDiscountPercentage: number | null;
  // Tax & charges
  sgstAmount: number | null;
  cgstAmount: number | null;
  handlingCharge: number | null;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}
