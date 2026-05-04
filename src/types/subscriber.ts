export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
  source: "Newsletter" | "Signup" | "Newsletter → Signup";
  convertedAt?: string | null;
  role?: "customer" | "wholesaler" | "clinic" | "all" | null;
}
