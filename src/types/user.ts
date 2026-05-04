export type UserRole = "customer" | "wholesaler" | "clinic";
export type BusinessStatus = "pending" | "verified" | "rejected" | "restricted" | "banned";

export interface VerificationHistoryEntry {
  action: BusinessStatus;
  note: string | null;
  timestamp: string;
  adminNote?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  isVerified: boolean;
  verificationToken: string | null;
  otpCreatedAt: string | null;
  verificationMethod: "email" | "phone" | null;
  createdAt: string;
  role: UserRole;
  // Legacy field — kept for backward compat, use businessStatus instead
  isBusinessVerified?: boolean;
  businessStatus?: BusinessStatus | null;
  verificationNote: string | null;
  verificationHistory?: VerificationHistoryEntry[] | null;
  // Profile
  avatar: string | null;
  address: string | null;
  gender: "male" | "female" | "other" | null;
  dateOfBirth: string | null;
  // Wholesaler
  businessName: string | null;
  gstNumber: string | null;
  businessAddress: string | null;
  yearsInBusiness: number | null;
  // Clinic
  institutionName: string | null;
  institutionType: "hospital" | "clinic" | "individual" | null;
  doctorRegNumber: string | null;
  specialisation: string | null;
  yearsOfPractice: number | null;
  wishlist?: string[];
}
