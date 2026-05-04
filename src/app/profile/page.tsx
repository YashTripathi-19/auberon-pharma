"use client";
import React, { useEffect, useState, useRef } from "react";import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Order } from "@/types/order";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/toastStore";
import { Loader2, Pencil } from "lucide-react";
import { AVATAR_OPTIONS, renderAvatar } from "@/components/avatars/AvatarOptions";
import { whatsappOrderConfirmed, whatsappOrderShipped, whatsappOrderCancelled } from "@/lib/whatsapp";

interface UserProfile {
  name: string; email: string; phone: string;
  role?: string;
  avatar?: string | null; address?: string | null;
  gender?: string | null; dateOfBirth?: string | null;
  createdAt?: string;
  // Business fields
  businessName?: string | null;
  gstNumber?: string | null;
  businessAddress?: string | null;
  yearsInBusiness?: number | null;
  doctorRegNumber?: string | null;
  specialisation?: string | null;
  institutionType?: string | null;
  institutionName?: string | null;
  yearsOfPractice?: number | null;
  isBusinessVerified?: boolean;
  verificationNote?: string | null;
}
const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  confirmed: "bg-blue-50 text-blue-600",
  dispatched: "bg-gray-100 text-gray-600",
  delivered: "bg-emerald-50 text-emerald-600",
  rejected: "bg-red-50 text-red-600",
  expired: "bg-gray-200 text-gray-500",
};

function Skeleton({ w, h }: { w?: string; h?: string }) {
  return <div className="animate-pulse bg-gray-100" style={{ width: w || "100%", height: h || "16px", borderRadius: "6px" }} />;
}

const label = { display: "block", fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "8px" };

export default function ProfilePage() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [restockStates, setRestockStates] = useState<Record<string, 'idle' | 'loading' | 'done' | 'exists'>>({});

  const [form, setForm] = useState({
    name: "", phone: "", address: "", gender: "", dateOfBirth: "", avatar: "", uploadedPhoto: "",
    businessName: "", gstNumber: "", businessAddress: "", yearsInBusiness: "",
    institutionName: "", institutionType: "", doctorRegNumber: "", specialisation: "", yearsOfPractice: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => { if (r.status === 401) { router.push("/login?redirect=/profile"); return null; } return r.json(); })
      .then((data) => {
        if (data) {
          setUser(data);
          setForm({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || "",
            gender: data.gender || "",
            dateOfBirth: data.dateOfBirth || "",
            avatar: data.avatar || "",
            uploadedPhoto: data.avatar?.startsWith("data:") ? data.avatar : "",
            businessName: data.businessName || "",
            gstNumber: data.gstNumber || "",
            businessAddress: data.businessAddress || "",
            yearsInBusiness: data.yearsInBusiness != null ? String(data.yearsInBusiness) : "",
            institutionName: data.institutionName || "",
            institutionType: data.institutionType || "",
            doctorRegNumber: data.doctorRegNumber || "",
            specialisation: data.specialisation || "",
            yearsOfPractice: data.yearsOfPractice != null ? String(data.yearsOfPractice) : "",
          });
        }
      })
      .finally(() => setLoadingUser(false));
  }, [router]);

  useEffect(() => {
    fetch("/api/auth/my-orders")
      .then((r) => r.ok ? r.json() : [])
      .then(setOrders)
      .finally(() => setLoadingOrders(false));
  }, []);

  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) { addToast("error", "Only JPEG and PNG images are allowed"); return; }
    if (file.size > 500 * 1024) { addToast("error", "Image must be under 500KB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForm((f) => ({ ...f, uploadedPhoto: dataUrl, avatar: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, phone: form.phone || undefined,
          address: form.address || null, gender: form.gender || null,
          dateOfBirth: form.dateOfBirth || null, avatar: form.avatar || null,
          businessName: form.businessName || null,
          gstNumber: form.gstNumber || null,
          businessAddress: form.businessAddress || null,
          yearsInBusiness: form.yearsInBusiness ? Number(form.yearsInBusiness) : null,
          institutionName: form.institutionName || null,
          institutionType: form.institutionType || null,
          doctorRegNumber: form.doctorRegNumber || null,
          specialisation: form.specialisation || null,
          yearsOfPractice: form.yearsOfPractice ? Number(form.yearsOfPractice) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setUser((u) => u ? { ...u, ...data } : data);
      setEditing(false);
      addToast("success", "Profile updated successfully");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) setForm({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      gender: user.gender || "",
      dateOfBirth: user.dateOfBirth || "",
      avatar: user.avatar || "",
      uploadedPhoto: user.avatar?.startsWith("data:") ? user.avatar : "",
      businessName: user.businessName || "",
      gstNumber: user.gstNumber || "",
      businessAddress: user.businessAddress || "",
      yearsInBusiness: user.yearsInBusiness != null ? String(user.yearsInBusiness) : "",
      institutionName: user.institutionName || "",
      institutionType: user.institutionType || "",
      doctorRegNumber: user.doctorRegNumber || "",
      specialisation: user.specialisation || "",
      yearsOfPractice: user.yearsOfPractice != null ? String(user.yearsOfPractice) : "",
    });
    setEditing(false);
  };

  const handleCancelOrder = async (orderId: string, isPaid: boolean) => {
    setCancelling(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel");
      setOrders((prev) => prev.map((o) =>
        o.id === orderId ? { ...o, status: "rejected", ...(data.refunded ? { paymentStatus: "refunded" } : {}) } : o
      ));
      setCancelConfirm(null);
      addToast("success", data.refunded ? "Order cancelled — refund initiated (5-7 business days)" : "Order cancelled successfully");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setCancelling(null);
    }
  };

  const handleRestockRequest = async (productId: string, productName: string, orderId: string) => {
    const itemKey = `${orderId}_${productId}`;
    setRestockStates((prev) => ({ ...prev, [itemKey]: 'loading' }));
    
    try {
      const res = await fetch("/api/restock-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, productName, orderId }),
      });
      
      const data = await res.json();
      
      if (res.status === 400 && data.error?.includes("already")) {
        setRestockStates((prev) => ({ ...prev, [itemKey]: 'exists' }));
      } else if (res.ok) {
        setRestockStates((prev) => ({ ...prev, [itemKey]: 'done' }));
      } else {
        throw new Error(data.error || "Failed to request restock alert");
      }
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to request restock alert");
      setRestockStates((prev) => ({ ...prev, [itemKey]: 'idle' }));
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-content" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div className="container-premium">

          {/* Page header */}
          <div style={{ marginBottom: "48px", textAlign: "center" }}>
            <p className="section-label" style={{ display: "block", marginBottom: "12px" }}>Account</p>
            <h1 className="section-title text-[2rem] md:text-[2.8rem]" style={{ marginBottom: "16px" }}>My Profile</h1>
            <p style={{ color: "var(--color-muted)", fontSize: "15px", lineHeight: "1.75", maxWidth: "480px", margin: "0 auto" }}>
              Manage your account details and view your order history.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left — User details card */}
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "36px 32px" }}>

                {loadingUser ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
                    <div className="animate-pulse bg-gray-100" style={{ width: "72px", height: "72px", borderRadius: "50%" }} />
                    <Skeleton w="60%" h="20px" /><Skeleton w="80%" /><Skeleton w="70%" />
                  </div>
                ) : (
                  <>
                    {/* Avatar + name */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
                      {renderAvatar(user?.avatar, 72)}
                      <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "#0B1F3A", textAlign: "center", marginTop: "14px" }}>{user?.name}</p>
                      {memberSince && <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>Member since {memberSince}</p>}
                    </div>

                    {/* Details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
                      {(user?.role === "wholesaler" ? [
                        { label: "Email", value: user?.email },
                        { label: "Phone", value: user?.phone || "—" },
                        ...(user?.businessName ? [{ label: "Business Name", value: user.businessName }] : []),
                        ...(user?.gstNumber ? [{ label: "GST Number", value: user.gstNumber }] : []),
                        ...(user?.businessAddress ? [{ label: "Business Address", value: user.businessAddress }] : []),
                        ...(user?.yearsInBusiness != null ? [{ label: "Years in Business", value: String(user.yearsInBusiness) }] : []),
                      ] : user?.role === "clinic" ? [
                        { label: "Email", value: user?.email },
                        { label: "Phone", value: user?.phone || "—" },
                        ...(user?.institutionName ? [{ label: "Institution Name", value: user.institutionName }] : []),
                        ...(user?.institutionType ? [{ label: "Institution Type", value: user.institutionType.charAt(0).toUpperCase() + user.institutionType.slice(1) }] : []),
                        ...(user?.doctorRegNumber ? [{ label: "Doctor Reg. No.", value: user.doctorRegNumber }] : []),
                        ...(user?.specialisation ? [{ label: "Specialisation", value: user.specialisation }] : []),
                        ...(user?.businessAddress ? [{ label: "Business Address", value: user.businessAddress }] : []),
                        ...(user?.yearsOfPractice != null ? [{ label: "Years of Practice", value: String(user.yearsOfPractice) }] : []),
                      ] : [
                        { label: "Email", value: user?.email },
                        { label: "Phone", value: user?.phone || "—" },
                        ...(user?.address ? [{ label: "Address", value: user.address }] : []),
                        ...(user?.gender ? [{ label: "Gender", value: user.gender.charAt(0).toUpperCase() + user.gender.slice(1) }] : []),
                        ...(user?.dateOfBirth ? [{ label: "Date of Birth", value: new Date(user.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) }] : []),
                      ]).map((item) => (
                        <div key={item.label}>
                          <p style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>{item.label}</p>
                          <p style={{ fontSize: "13px", color: "#0B1F3A", lineHeight: 1.5 }}>{item.value}</p>
                        </div>
                      ))}
                      {/* Business verification badge */}
                      {(user?.role === "wholesaler" || user?.role === "clinic") && (
                        <div>
                          {(() => {
                            const status = (user as { businessStatus?: string }).businessStatus || (user.isBusinessVerified ? "verified" : "pending");
                            const styles: Record<string, { bg: string; color: string; label: string }> = {
                              pending:    { bg: "#fffbeb", color: "#92400e", label: "⏳ Pending Verification" },
                              verified:   { bg: "#f0fdf4", color: "#16a34a", label: "✓ Verified Business" },
                              rejected:   { bg: "#fef2f2", color: "#dc2626", label: "✗ Account Rejected" },
                              restricted: { bg: "#fff7ed", color: "#c2410c", label: "⚠ Account Restricted" },
                              banned:     { bg: "#fef2f2", color: "#7f1d1d", label: "🔒 Account Banned" },
                            };
                            const s = styles[status] || styles.pending;
                            return (
                              <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 12px", borderRadius: "999px", background: s.bg, color: s.color }}>
                                {s.label}
                              </span>
                            );
                          })()}
                          {user.verificationNote && (
                            <p style={{ fontSize: "12px", color: "#6E6E73", marginTop: "6px" }}>{user.verificationNote}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setEditing(!editing)}
                      className="btn-primary btn-gold"
                      style={{ width: "100%", fontSize: "13px", padding: "11px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    >
                      <Pencil size={13} /> {editing ? "Close Editor" : "Edit Profile"}
                    </button>

                    {/* Inline edit form */}
                    <AnimatePresence>
                      {editing && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{ paddingTop: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
                            <div style={{ height: "1px", background: "rgba(0,0,0,0.06)", marginBottom: "4px" }} />

                            {/* Avatar selector — 4×2 grid, no overflow */}
                            <div>
                              <p style={label}>Avatar</p>
                              {/* 4 columns × 2 rows = 8 avatars, fully visible, no scroll */}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "14px", width: "100%" }}>
                                {AVATAR_OPTIONS.map((opt) => {
                                  // Gold ring only if this default is active AND no uploaded photo is active
                                  const isActive = form.avatar === opt.key && !form.uploadedPhoto;
                                  return (
                                    <button key={opt.key} type="button"
                                      onClick={() => setForm((f) => ({ ...f, avatar: opt.key, uploadedPhoto: "" }))}
                                      aria-label={`Select ${opt.label} avatar`}
                                      style={{ width: "100%", aspectRatio: "1", borderRadius: "50%", padding: 0, border: isActive ? "3px solid #C9963E" : "3px solid transparent", outline: isActive ? "2px solid #C9963E" : "none", outlineOffset: "2px", cursor: "pointer", overflow: "hidden", background: "none", transition: "all 0.15s" }}>
                                      <opt.Component size={64} />
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Upload photo — always visible, independent of grid selection */}
                              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" style={{ display: "none" }} onChange={handleAvatarUpload} />
                              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                  style={{ fontSize: "12px", color: "#C9963E", background: "none", border: "1px solid #C9963E", borderRadius: "999px", padding: "6px 16px", cursor: "pointer", fontWeight: 500, flexShrink: 0 }}>
                                  Upload Photo
                                </button>
                                {/* Uploaded photo preview — always shown if a photo was uploaded, regardless of which default is selected */}
                                {form.uploadedPhoto && (
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <button type="button" onClick={() => setForm((f) => ({ ...f, uploadedPhoto: f.uploadedPhoto, avatar: f.uploadedPhoto }))}
                                      aria-label="Use uploaded photo"
                                      style={{ padding: 0, background: "none", border: form.avatar === form.uploadedPhoto ? "3px solid #C9963E" : "3px solid transparent", borderRadius: "50%", cursor: "pointer", outline: form.avatar === form.uploadedPhoto ? "2px solid #C9963E" : "none", outlineOffset: "2px" }}>
                                      <img src={form.uploadedPhoto} alt="Uploaded" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", display: "block" }} />
                                    </button>
                                    <button type="button" onClick={() => setForm((f) => ({ ...f, uploadedPhoto: "", avatar: f.avatar === f.uploadedPhoto ? "" : f.avatar }))}
                                      style={{ fontSize: "11px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }}>
                                      Remove
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <label style={label}>Name</label>
                              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-premium" placeholder="Your full name" />
                            </div>

                            <div>
                              <label style={label}>Phone</label>
                              <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input-premium" placeholder="10-digit number" />
                            </div>

                            {/* Customer fields */}
                            {(!user?.role || user.role === "customer") && (
                              <>
                                <div>
                                  <label style={label}>Address</label>
                                  <textarea rows={3} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="input-premium" placeholder="Your delivery address" />
                                </div>
                                <div>
                                  <label style={label}>Gender</label>
                                  <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className="input-premium">
                                    <option value="">Prefer not to say</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                                <div>
                                  <label style={label}>Date of Birth</label>
                                  <input type="date" value={form.dateOfBirth} onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} className="input-premium" />
                                </div>
                              </>
                            )}

                            {/* Wholesaler fields */}
                            {user?.role === "wholesaler" && (
                              <>
                                <div>
                                  <label style={label}>Business Name</label>
                                  <input value={form.businessName} onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))} className="input-premium" placeholder="Company or trade name" />
                                </div>
                                <div>
                                  <label style={label}>GST Number</label>
                                  <input value={form.gstNumber} onChange={(e) => setForm((f) => ({ ...f, gstNumber: e.target.value.toUpperCase() }))} className="input-premium" placeholder="15-character GST number" maxLength={15} />
                                </div>
                                <div>
                                  <label style={label}>Business Address</label>
                                  <textarea rows={3} value={form.businessAddress} onChange={(e) => setForm((f) => ({ ...f, businessAddress: e.target.value }))} className="input-premium" placeholder="Registered business address" />
                                </div>
                                <div>
                                  <label style={label}>Years in Business</label>
                                  <input type="number" min="0" value={form.yearsInBusiness} onChange={(e) => setForm((f) => ({ ...f, yearsInBusiness: e.target.value }))} className="input-premium" placeholder="Optional" />
                                </div>
                              </>
                            )}

                            {/* Clinic fields */}
                            {user?.role === "clinic" && (
                              <>
                                <div>
                                  <label style={label}>Institution Name</label>
                                  <input value={form.institutionName} onChange={(e) => setForm((f) => ({ ...f, institutionName: e.target.value }))} className="input-premium" placeholder="Hospital / clinic name" />
                                </div>
                                <div>
                                  <label style={label}>Institution Type</label>
                                  <select value={form.institutionType} onChange={(e) => setForm((f) => ({ ...f, institutionType: e.target.value }))} className="input-premium">
                                    <option value="">Select type</option>
                                    <option value="hospital">Hospital</option>
                                    <option value="clinic">Clinic</option>
                                    <option value="individual">Individual Practice</option>
                                  </select>
                                </div>
                                <div>
                                  <label style={label}>Doctor Reg. No.</label>
                                  <input value={form.doctorRegNumber} onChange={(e) => setForm((f) => ({ ...f, doctorRegNumber: e.target.value }))} className="input-premium" placeholder="Medical council registration" />
                                </div>
                                <div>
                                  <label style={label}>Specialisation</label>
                                  <input value={form.specialisation} onChange={(e) => setForm((f) => ({ ...f, specialisation: e.target.value }))} className="input-premium" placeholder="e.g. Ophthalmology" />
                                </div>
                                <div>
                                  <label style={label}>Business Address</label>
                                  <textarea rows={3} value={form.businessAddress} onChange={(e) => setForm((f) => ({ ...f, businessAddress: e.target.value }))} className="input-premium" placeholder="Clinic / hospital address" />
                                </div>
                                <div>
                                  <label style={label}>Years of Practice</label>
                                  <input type="number" min="0" value={form.yearsOfPractice} onChange={(e) => setForm((f) => ({ ...f, yearsOfPractice: e.target.value }))} className="input-premium" placeholder="Optional" />
                                </div>
                              </>
                            )}

                            <div style={{ display: "flex", gap: "10px" }}>
                              <button onClick={handleSave} disabled={saving} className="btn-primary btn-gold" style={{ flex: 1, fontSize: "13px", padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: saving ? 0.6 : 1 }}>
                                {saving ? <><Loader2 size={13} className="animate-spin" />Saving...</> : "Save Changes"}
                              </button>
                              <button onClick={handleCancel} style={{ flex: 1, fontSize: "13px", padding: "11px 16px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.12)", background: "transparent", cursor: "pointer", color: "#6E6E73", fontWeight: 500 }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            </div>

            {/* Right — Order history */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>

                <div style={{ padding: "28px 32px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#0B1F3A" }}>Order History</p>
                  <p style={{ fontSize: "13px", color: "#6E6E73", marginTop: "4px" }}>{loadingOrders ? "Loading..." : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}</p>
                </div>

                {loadingOrders ? (
                  <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                        <Skeleton w="120px" /><Skeleton w="160px" /><Skeleton w="60px" /><Skeleton w="80px" />
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ padding: "64px 32px", textAlign: "center" }}>
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#0B1F3A", marginBottom: "8px" }}>You haven&apos;t placed any orders yet</p>
                    <p style={{ fontSize: "13px", color: "#6E6E73", marginBottom: "24px" }}>Browse our product catalogue to get started.</p>
                    <Link href="/products" className="btn-primary btn-gold" style={{ fontSize: "13px", padding: "10px 24px" }}>Browse Products</Link>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Order history">
                      <thead>
                        <tr style={{ background: "#F5F5F7", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                          {["Order ID", "Product", "Qty", "Total", "Date", "Status", "Payment", ""].map((h) => (
                            <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, i) => {
                          const total = order.totalAmount
                            ? formatCurrency(order.totalAmount)
                            : order.amountPaid
                            ? formatCurrency(order.amountPaid / 100)
                            : "—";
                          const itemsLabel = order.items && order.items.length > 1
                            ? `${order.items.length} items`
                            : order.items?.[0]?.productName || order.productName || "—";
                          const totalQty = order.items
                            ? order.items.reduce((s, i) => s + i.quantity, 0)
                            : order.quantity;
                          const canCancel = order.status === "pending" || order.status === "confirmed";
                          const isPaid = order.paymentStatus === "paid" || (!order.paymentStatus && !!order.paymentId);
                          const isConfirming = cancelConfirm === order.id;
                          return (
                            <React.Fragment key={order.id}>
                              <tr style={{ borderBottom: isConfirming ? "none" : i < orders.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }} className="hover:bg-[#F5F5F7] transition-colors">
                                <td style={{ padding: "16px 20px", fontFamily: "monospace", fontSize: "11px", color: "#6E6E73", whiteSpace: "nowrap" }}>{order.id.slice(0, 16)}…</td>
                                <td style={{ padding: "16px 20px", fontSize: "13px", color: "#0B1F3A" }}>
                                  {order.items && order.items.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                      {order.items.map((item, idx) => {
                                        const itemKey = `${order.id}_${item.productId}`;
                                        const restockState = restockStates[itemKey] || 'idle';
                                        const showRestockBtn = (order.status === "rejected" || (order.status as string) === "cancelled");
                                        
                                        return (
                                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                            <span style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                              {item.productName}
                                            </span>
                                            {showRestockBtn && restockState === 'idle' && (
                                              <button
                                                onClick={() => handleRestockRequest(item.productId, item.productName, order.id)}
                                                style={{
                                                  fontSize: "12px",
                                                  color: "#c9933a",
                                                  background: "transparent",
                                                  border: "1px solid #c9933a",
                                                  borderRadius: "20px",
                                                  padding: "4px 12px",
                                                  cursor: "pointer",
                                                  fontWeight: 500,
                                                  whiteSpace: "nowrap",
                                                  transition: "all 0.2s"
                                                }}
                                                onMouseEnter={(e) => {
                                                  e.currentTarget.style.background = "#c9933a";
                                                  e.currentTarget.style.color = "white";
                                                }}
                                                onMouseLeave={(e) => {
                                                  e.currentTarget.style.background = "transparent";
                                                  e.currentTarget.style.color = "#c9933a";
                                                }}
                                              >
                                                Notify when back
                                              </button>
                                            )}
                                            {showRestockBtn && restockState === 'loading' && (
                                              <span style={{ fontSize: "12px", color: "#6E6E73" }}>...</span>
                                            )}
                                            {showRestockBtn && restockState === 'done' && (
                                              <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 500 }}>✓ We&apos;ll notify you</span>
                                            )}
                                            {showRestockBtn && restockState === 'exists' && (
                                              <span style={{ fontSize: "12px", color: "#c9933a", fontWeight: 500 }}>✓ Alert set</span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <span style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      {order.productName || "—"}
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: "16px 20px", fontSize: "13px", color: "#6E6E73", textAlign: "center" }}>{totalQty}</td>
                                <td style={{ padding: "16px 20px", fontSize: "13px", color: "#0B1F3A", whiteSpace: "nowrap" }}>{total}</td>
                                <td style={{ padding: "16px 20px", fontSize: "11px", color: "#6E6E73", whiteSpace: "nowrap" }}>{formatDate(order.createdAt)}</td>
                                <td style={{ padding: "16px 20px" }}>
                                  <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-full capitalize ${statusStyle[order.status] || "bg-gray-100 text-gray-600"}`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td style={{ padding: "16px 20px" }}>
                                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px", whiteSpace: "nowrap",
                                    background: order.paymentStatus === "paid" ? "#f0fdf4" : order.paymentStatus === "refunded" ? "#F5F5F7" : order.paymentStatus === "failed" ? "#fef2f2" : "#fffbeb",
                                    color: order.paymentStatus === "paid" ? "#16a34a" : order.paymentStatus === "refunded" ? "#6E6E73" : order.paymentStatus === "failed" ? "#dc2626" : "#92400e",
                                  }}>
                                    {order.paymentStatus || "pending"}
                                  </span>
                                </td>
                                <td style={{ padding: "16px 20px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    {canCancel && (
                                      <button
                                        onClick={() => setCancelConfirm(isConfirming ? null : order.id)}
                                        style={{ fontSize: "11px", color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap", padding: 0 }}
                                      >
                                        Cancel
                                      </button>
                                    )}
                                    <a
                                      href={
                                        ["dispatched", "out_for_delivery"].includes(order.status)
                                          ? whatsappOrderShipped(order.id)
                                          : ["rejected", "cancelled"].includes(order.status)
                                          ? whatsappOrderCancelled(order.id)
                                          : whatsappOrderConfirmed(order.id)
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        background: "#f0fdf4",
                                        border: "1px solid #25D366",
                                        borderRadius: "999px",
                                        padding: "3px 8px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#25D366",
                                        textDecoration: "none",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366">
                                        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.418A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 0 1-4.073-1.117l-.292-.174-3.027.863.872-2.944-.19-.302A7.95 7.95 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.406-5.884c-.241-.12-1.427-.703-1.648-.784-.221-.08-.382-.12-.543.12-.16.241-.622.784-.763.944-.14.161-.281.181-.522.06-.241-.12-1.018-.375-1.939-1.196-.716-.638-1.2-1.426-1.341-1.667-.14-.241-.015-.371.106-.491.108-.108.241-.281.362-.422.12-.14.16-.241.241-.402.08-.16.04-.301-.02-.422-.06-.12-.543-1.307-.743-1.79-.196-.47-.395-.406-.543-.414l-.462-.008c-.16 0-.422.06-.643.301-.221.241-.843.824-.843 2.01 0 1.186.863 2.332.983 2.493.12.16 1.698 2.593 4.115 3.637.575.248 1.023.396 1.372.507.577.183 1.102.157 1.517.095.463-.069 1.427-.583 1.628-1.146.2-.563.2-1.045.14-1.146-.06-.1-.221-.16-.462-.281z"/>
                                      </svg>
                                      WhatsApp
                                    </a>
                                  </div>
                                </td>
                              </tr>
                              {isConfirming && (
                                <tr style={{ background: "#fef2f2", borderBottom: i < orders.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                                  <td colSpan={8} style={{ padding: "12px 20px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "13px", color: "#374151" }}>Are you sure you want to cancel this order?</span>
                                      <button
                                        onClick={() => handleCancelOrder(order.id, isPaid)}
                                        disabled={cancelling === order.id}
                                        style={{ fontSize: "12px", fontWeight: 600, color: "white", background: "#dc2626", border: "none", borderRadius: "999px", padding: "6px 16px", cursor: "pointer", opacity: cancelling === order.id ? 0.6 : 1 }}
                                      >
                                        {cancelling === order.id ? "Cancelling…" : "Yes, Cancel"}
                                      </button>
                                      <button
                                        onClick={() => setCancelConfirm(null)}
                                        style={{ fontSize: "12px", fontWeight: 500, color: "#6E6E73", background: "none", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "999px", padding: "6px 16px", cursor: "pointer" }}
                                      >
                                        Keep Order
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
