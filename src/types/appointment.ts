export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  serviceId: string;
  doctorId: string | null;
  doctorName: string | null;
  preferredDate: string;
  preferredTime: string;
  notes: string | null;
  status: "requested" | "confirmed" | "cancelled" | "completed";
  userId: string | null;
  createdAt: string;
}
