export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: "percentage" | "flat";
  value: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  applicableTo: "all" | "customer" | "wholesaler" | "clinic";
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}
