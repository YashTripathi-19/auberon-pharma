"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Coupon } from "@/types/coupon";
import { useToastStore } from "@/store/toastStore";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["all", "active", "expired", "inactive"] as const;
type Tab = typeof TABS[number];

const emptyForm = {
  code: "", description: "", type: "percentage" as "percentage" | "flat",
  value: "", minOrderValue: "0", maxDiscountAmount: "", applicableTo: "all" as Coupon["applicableTo"],
  usageLimit: "", expiresAt: "", isActive: true,
};

function isCouponExpired(c: Coupon) {
  return !!c.expiresAt && new Date(c.expiresAt) < new Date();
}

export default function AdminCouponsPage() {
  const router = useRouter();
  const formRef = React.useRef<HTMLDivElement>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  // Role discounts state
  const [roleDiscounts, setRoleDiscounts] = useState({
    customer: { percentage: 0, isActive: false },
    wholesaler: { percentage: 0, isActive: false },
    clinic: { percentage: 0, isActive: false },
  });
  const [savingRD, setSavingRD] = useState(false);

  // Combo offers state
  const [slowMovers, setSlowMovers] = useState<{ id: string; name: string; unitsSold: number }[]>([]);
  const [popularCombos, setPopularCombos] = useState<{ productA: string; productB: string; nameA: string; nameB: string; count: number }[]>([]);

  // Live sale state
  const [liveSale, setLiveSale] = useState({ isActive: false, title: "Flash Sale", subtitle: "Limited time offer — shop now!", discountPercentage: 0, applicableTo: "all", endsAt: "", bannerColor: "gold", showCountdown: true });
  const [savingLS, setSavingLS] = useState(false);

  const fetchCoupons = useCallback(async () => {
    const res = await fetch("/api/admin/coupons");
    if (res.ok) setCoupons(await res.json());
  }, []);

  const fetchRoleDiscounts = useCallback(async () => {
    const res = await fetch("/api/settings/role-discounts");
    if (res.ok) setRoleDiscounts(await res.json());
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchRoleDiscounts();
    fetch("/api/admin/products/slow-movers").then((r) => r.ok ? r.json() : []).then(setSlowMovers).catch(() => {});
    fetch("/api/admin/products/popular-combos").then((r) => r.ok ? r.json() : []).then(setPopularCombos).catch(() => {});
    fetch("/api/settings/live-sale").then((r) => r.ok ? r.json() : null).then((d) => { if (d) setLiveSale({ ...d, endsAt: d.endsAt ? d.endsAt.split("T")[0] + "T" + d.endsAt.split("T")[1]?.slice(0, 5) : "" }); }).catch(() => {});
  }, [fetchCoupons, fetchRoleDiscounts]);

  const filtered = coupons.filter((c) => {
    if (tab === "active") return c.isActive && !isCouponExpired(c);
    if (tab === "expired") return isCouponExpired(c);
    if (tab === "inactive") return !c.isActive;
    return true;
  });

  const totalUses = coupons.reduce((s, c) => s + c.usageCount, 0);
  const activeCount = coupons.filter((c) => c.isActive && !isCouponExpired(c)).length;

  const openCreate = () => { setForm({ ...emptyForm }); setEditId(null); setShowForm(true); };
  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code, description: c.description, type: c.type,
      value: String(c.value), minOrderValue: String(c.minOrderValue),
      maxDiscountAmount: c.maxDiscountAmount !== null ? String(c.maxDiscountAmount) : "",
      applicableTo: c.applicableTo,
      usageLimit: c.usageLimit !== null ? String(c.usageLimit) : "",
      expiresAt: c.expiresAt ? c.expiresAt.split("T")[0] : "",
      isActive: c.isActive,
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.description || !form.value) { addToast("error", "Code, description and value are required"); return; }
    if (!/^[A-Z0-9-]+$/.test(form.code)) { addToast("error", "Code must be alphanumeric (A-Z, 0-9, hyphens only)"); return; }
    if (form.type === "percentage" && Number(form.value) > 100) { addToast("error", "Percentage cannot exceed 100"); return; }
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        description: form.description,
        type: form.type,
        value: Number(form.value),
        minOrderValue: Number(form.minOrderValue) || 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        applicableTo: form.applicableTo,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        isActive: form.isActive,
      };
      const url = editId ? `/api/admin/coupons/${editId}` : "/api/admin/coupons";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      addToast("success", editId ? "Coupon updated" : "Coupon created");
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c: Coupon) => {
    const res = await fetch(`/api/admin/coupons/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !c.isActive }) });
    if (res.ok) { setCoupons((prev) => prev.map((x) => x.id === c.id ? { ...x, isActive: !c.isActive } : x)); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) { setCoupons((prev) => prev.filter((c) => c.id !== id)); setDeleteConfirm(null); addToast("success", "Coupon deleted"); }
  };

  const handleSaveRoleDiscounts = async () => {
    setSavingRD(true);
    try {
      const res = await fetch("/api/admin/settings/role-discounts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roleDiscounts }) });
      if (!res.ok) throw new Error();
      addToast("success", "Role discounts saved");
    } catch { addToast("error", "Failed to save"); }
    finally { setSavingRD(false); }
  };

  const handleSaveLiveSale = async (active: boolean) => {
    setSavingLS(true);
    try {
      const payload = { ...liveSale, isActive: active, endsAt: liveSale.endsAt ? new Date(liveSale.endsAt).toISOString() : null, discountPercentage: Number(liveSale.discountPercentage) };
      const res = await fetch("/api/admin/settings/live-sale", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      setLiveSale((s) => ({ ...s, isActive: active }));
      addToast("success", active ? "Live sale activated!" : "Sale deactivated");
    } catch { addToast("error", "Failed to save"); }
    finally { setSavingLS(false); }
  };

  const prefillAndOpen = (values: Partial<typeof emptyForm>) => {
    setForm({ ...emptyForm, ...values });
    setEditId(null);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleSendToAudience = (c: Coupon) => {
    const valueStr = c.type === "percentage" ? `${c.value}%` : `Rs. ${c.value}`;
    const expiry = c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "No expiry";
    const minOrder = c.minOrderValue > 0 ? `Rs. ${c.minOrderValue}` : "None";
    const audienceLabel = c.applicableTo === "all" ? "Valued Customer" : c.applicableTo.charAt(0).toUpperCase() + c.applicableTo.slice(1);
    const recipientMap: Record<string, string> = { all: "all", customer: "customers", wholesaler: "wholesalers", clinic: "clinics" };
    const role = recipientMap[c.applicableTo] || "all";
    const subject = `Exclusive Offer for You — ${c.code} | Auberon Pharmaceuticals`;
    const message = `Dear ${audienceLabel},\n\nWe have an exclusive offer just for you!\n\nUse code ${c.code} at checkout to get ${valueStr} off your next order.\n\n${c.description}\n\nMinimum order value: ${minOrder} | Valid till: ${expiry}\n\nShop now at Auberon Pharmaceuticals.\n\n— Team Auberon Pharmaceuticals`;
    router.push(`/admin/subscribers?subject=${encodeURIComponent(subject)}&message=${encodeURIComponent(message)}&role=${role}`);
  };

  const statusBadge = (c: Coupon) => {
    if (isCouponExpired(c)) return <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#fef2f2", color: "#dc2626" }}>Expired</span>;
    if (!c.isActive) return <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#F5F5F7", color: "#6E6E73" }}>Inactive</span>;
    return <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#f0fdf4", color: "#16a34a" }}>Active</span>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Live Sale Panel */}
      <div style={{ background: liveSale.isActive ? "#fef2f2" : "white", borderRadius: "20px", border: `1.5px solid ${liveSale.isActive ? "#fecaca" : "rgba(0,0,0,0.06)"}`, padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          {liveSale.isActive && <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#dc2626", display: "inline-block", animation: "pulse 1.5s infinite" }} />}
          <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#0B1F3A" }}>Live Sale Control</p>
          {liveSale.isActive && <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", background: "#dc2626", color: "white" }}>ACTIVE</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div><label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Sale Title</label>
            <input value={liveSale.title} onChange={(e) => setLiveSale((s) => ({ ...s, title: e.target.value }))} className="input-premium" placeholder="Flash Sale" /></div>
          <div><label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Subtitle</label>
            <input value={liveSale.subtitle} onChange={(e) => setLiveSale((s) => ({ ...s, subtitle: e.target.value }))} className="input-premium" placeholder="Limited time offer!" /></div>
          <div><label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Discount %</label>
            <input type="number" min="0" max="100" value={liveSale.discountPercentage} onChange={(e) => setLiveSale((s) => ({ ...s, discountPercentage: Number(e.target.value) }))} className="input-premium" /></div>
          <div><label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Applicable To</label>
            <select value={liveSale.applicableTo} onChange={(e) => setLiveSale((s) => ({ ...s, applicableTo: e.target.value }))} className="input-premium">
              <option value="all">All Users</option><option value="customer">Customers</option><option value="wholesaler">Wholesalers</option><option value="clinic">Clinics</option>
            </select></div>
          <div><label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>End Date & Time</label>
            <input type="datetime-local" value={liveSale.endsAt} onChange={(e) => setLiveSale((s) => ({ ...s, endsAt: e.target.value }))} className="input-premium" /></div>
          <div><label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Banner Color</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["gold", "navy", "red"] as const).map((c) => (
                <button key={c} type="button" onClick={() => setLiveSale((s) => ({ ...s, bannerColor: c }))}
                  style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `2px solid ${liveSale.bannerColor === c ? "#c9933a" : "rgba(0,0,0,0.1)"}`, background: c === "gold" ? "#c9933a" : c === "navy" ? "#1a2744" : "#dc2626", cursor: "pointer", height: "32px" }} />
              ))}
            </div></div>
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "20px", alignItems: "center" }}>
          <button onClick={() => handleSaveLiveSale(true)} disabled={savingLS} className="btn-primary btn-gold" style={{ fontSize: "13px", padding: "11px 24px", opacity: savingLS ? 0.6 : 1 }}>
            {savingLS ? "Saving…" : "Save & Activate"}
          </button>
          {liveSale.isActive && (
            <button onClick={() => handleSaveLiveSale(false)} disabled={savingLS} style={{ fontSize: "13px", padding: "11px 24px", borderRadius: "999px", background: "#dc2626", color: "white", border: "none", cursor: "pointer", fontWeight: 500, opacity: savingLS ? 0.6 : 1 }}>
              Deactivate Sale
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.1 }}>Coupons & Promotions</h1>
          <p style={{ fontSize: "14px", color: "#6E6E73", marginTop: "6px" }}>Manage discount codes and promotional offers</p>
        </div>
        <button onClick={openCreate} className="btn-primary btn-gold" style={{ fontSize: "13px", padding: "12px 24px", flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <Plus size={15} /> Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {[
          { label: "Total Coupons", value: coupons.length },
          { label: "Active", value: activeCount },
          { label: "Total Uses", value: totalUses },
        ].map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.06)", padding: "16px 24px", display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "22px", fontWeight: 700, color: "#0B1F3A" }}>{s.value}</span>
            <span style={{ fontSize: "12px", color: "#6E6E73" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <div ref={formRef} style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "32px" }}>
          <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "24px" }}>{editId ? "Edit Coupon" : "Create Coupon"}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Coupon Code *</label>
              <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "") }))} className="input-premium" placeholder="e.g. SAVE20" />
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Description *</label>
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-premium" placeholder="Shown to customer" />
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Discount Type</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["percentage", "flat"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
                    style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1.5px solid", fontSize: "13px", fontWeight: 500, cursor: "pointer", borderColor: form.type === t ? "#c9933a" : "rgba(0,0,0,0.1)", background: form.type === t ? "#fef9ec" : "white", color: form.type === t ? "#c9933a" : "#6E6E73" }}>
                    {t === "percentage" ? "Percentage %" : "Flat Rs."}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Value * {form.type === "percentage" ? "(%)" : "(Rs.)"}</label>
              <input type="number" min="0" max={form.type === "percentage" ? 100 : undefined} value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} className="input-premium" placeholder={form.type === "percentage" ? "e.g. 20" : "e.g. 200"} />
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Min Order Value (Rs.)</label>
              <input type="number" min="0" value={form.minOrderValue} onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))} className="input-premium" placeholder="0 = no minimum" />
            </div>
            {form.type === "percentage" && (
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Max Discount Cap (Rs.)</label>
                <input type="number" min="0" value={form.maxDiscountAmount} onChange={(e) => setForm((f) => ({ ...f, maxDiscountAmount: e.target.value }))} className="input-premium" placeholder="Leave blank for no cap" />
              </div>
            )}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Applicable To</label>
              <select value={form.applicableTo} onChange={(e) => setForm((f) => ({ ...f, applicableTo: e.target.value as Coupon["applicableTo"] }))} className="input-premium">
                <option value="all">All Users</option>
                <option value="customer">Customers Only</option>
                <option value="wholesaler">Wholesalers Only</option>
                <option value="clinic">Clinics Only</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Usage Limit</label>
              <input type="number" min="0" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} className="input-premium" placeholder="Leave blank for unlimited" />
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Expiry Date</label>
              <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} className="input-premium" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "24px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "#0B1F3A" }}>Active</label>
              <button type="button" onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))} style={{ background: "none", border: "none", cursor: "pointer", color: form.isActive ? "#16a34a" : "#9CA3AF" }}>
                {form.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
            <button onClick={handleSave} disabled={saving} className="btn-primary btn-gold" style={{ fontSize: "13px", padding: "11px 28px", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : editId ? "Update Coupon" : "Create Coupon"}
            </button>
            <button onClick={() => setShowForm(false)} style={{ fontSize: "13px", padding: "11px 20px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.12)", background: "transparent", cursor: "pointer", color: "#6E6E73", fontWeight: 500 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "8px 18px", borderRadius: "999px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: tab === t ? "none" : "1px solid rgba(0,0,0,0.08)", background: tab === t ? "#0B1F3A" : "white", color: tab === t ? "white" : "#6E6E73", textTransform: "capitalize" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Coupons table */}
      <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Coupons table">
            <thead>
              <tr style={{ background: "#F5F5F7", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                {["Code", "Type", "Value", "Min Order", "Applicable To", "Usage", "Expires", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "48px", fontSize: "14px", color: "#6E6E73" }}>No coupons found</td></tr>
              ) : filtered.map((c, i) => (
                <React.Fragment key={c.id}>
                  <tr style={{ borderBottom: deleteConfirm === c.id ? "none" : i < filtered.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }} className="hover:bg-[#F5F5F7] transition-colors">
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: "#c9933a" }}>{c.code}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: c.type === "percentage" ? "#eff6ff" : "#fef9ec", color: c.type === "percentage" ? "#2563eb" : "#c9933a" }}>
                        {c.type === "percentage" ? "%" : "Flat"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#0B1F3A", fontWeight: 600 }}>{c.type === "percentage" ? `${c.value}%` : `Rs. ${c.value}`}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6E6E73" }}>{c.minOrderValue > 0 ? `Rs. ${c.minOrderValue}` : "None"}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "999px", background: "#F5F5F7", color: "#0B1F3A", textTransform: "capitalize" }}>{c.applicableTo}</span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6E6E73" }}>{c.usageCount} / {c.usageLimit !== null ? c.usageLimit : "∞"}</td>
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "#6E6E73", whiteSpace: "nowrap" }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}</td>
                    <td style={{ padding: "14px 16px" }}>{statusBadge(c)}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <button onClick={() => openEdit(c)} style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }} className="hover:bg-black/[0.06]" aria-label="Edit"><Pencil size={13} style={{ color: "#6E6E73" }} /></button>
                        <button onClick={() => handleToggle(c)} style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }} className="hover:bg-black/[0.06]" aria-label="Toggle active">
                          {c.isActive ? <ToggleRight size={15} style={{ color: "#16a34a" }} /> : <ToggleLeft size={15} style={{ color: "#9CA3AF" }} />}
                        </button>
                        <button onClick={() => handleSendToAudience(c)} style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }} className="hover:bg-blue-50" aria-label="Send to audience" title={isCouponExpired(c) ? "Expired — sending may confuse customers" : "Send to audience"}>
                          <Send size={13} style={{ color: isCouponExpired(c) ? "#f97316" : "#2563eb" }} />
                        </button>
                        <button onClick={() => setDeleteConfirm(deleteConfirm === c.id ? null : c.id)} style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }} className="hover:bg-red-50" aria-label="Delete"><Trash2 size={13} style={{ color: "#dc2626" }} /></button>
                      </div>
                    </td>
                  </tr>
                  {deleteConfirm === c.id && (
                    <tr style={{ background: "#fef2f2", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                      <td colSpan={9} style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "13px", color: "#374151" }}>Delete coupon <strong>{c.code}</strong>?</span>
                          <button onClick={() => handleDelete(c.id)} style={{ fontSize: "12px", fontWeight: 600, color: "white", background: "#dc2626", border: "none", borderRadius: "999px", padding: "5px 14px", cursor: "pointer" }}>Confirm Delete</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: "12px", color: "#6E6E73", background: "none", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "999px", padding: "5px 14px", cursor: "pointer" }}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Discounts panel */}      <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "32px" }}>
        <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "6px" }}>Automatic Role Discounts</p>
        <p style={{ fontSize: "13px", color: "#6E6E73", marginBottom: "24px" }}>Applied automatically at checkout based on user role — no coupon code needed.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {(["customer", "wholesaler", "clinic"] as const).map((role) => (
            <div key={role} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", background: "#F9F9FB", borderRadius: "14px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#0B1F3A", textTransform: "capitalize", width: "100px", flexShrink: 0 }}>{role}</span>
              <input
                type="number" min="0" max="100"
                value={roleDiscounts[role].percentage}
                onChange={(e) => setRoleDiscounts((prev) => ({ ...prev, [role]: { ...prev[role], percentage: Number(e.target.value) } }))}
                style={{ width: "80px", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "13px", textAlign: "center" }}
              />
              <span style={{ fontSize: "13px", color: "#6E6E73" }}>% off</span>
              <button type="button" onClick={() => setRoleDiscounts((prev) => ({ ...prev, [role]: { ...prev[role], isActive: !prev[role].isActive } }))}
                style={{ background: "none", border: "none", cursor: "pointer", color: roleDiscounts[role].isActive ? "#16a34a" : "#9CA3AF", marginLeft: "auto" }}>
                {roleDiscounts[role].isActive ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
              </button>
              <span style={{ fontSize: "12px", color: roleDiscounts[role].isActive ? "#16a34a" : "#9CA3AF", width: "60px" }}>{roleDiscounts[role].isActive ? "Active" : "Off"}</span>
            </div>
          ))}
        </div>
        <button onClick={handleSaveRoleDiscounts} disabled={savingRD} className="btn-primary btn-gold" style={{ fontSize: "13px", padding: "11px 28px", marginTop: "20px", opacity: savingRD ? 0.6 : 1 }}>
          {savingRD ? "Saving…" : "Save Role Discounts"}
        </button>
      </div>

      {/* Combo Offers panel */}
      <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "32px" }}>
        <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "6px" }}>Combo Offers</p>
        <p style={{ fontSize: "13px", color: "#6E6E73", marginBottom: "24px" }}>Auto-detected opportunities to boost sales with targeted promotions.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Slow movers */}
          <div style={{ background: "#F9F9FB", borderRadius: "14px", padding: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#0B1F3A", marginBottom: "4px" }}>Boost Slow Sellers</p>
            <p style={{ fontSize: "12px", color: "#6E6E73", marginBottom: "16px" }}>Products with fewest sales in last 90 days</p>
            {slowMovers.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#9CA3AF" }}>No data yet</p>
            ) : slowMovers.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#0B1F3A", fontWeight: 500 }}>{p.name}</p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{p.unitsSold} units sold</p>
                </div>
                  <button
                  onClick={() => {
                    const code = `COMBO-${p.name.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 4)}`;
                    prefillAndOpen({
                      code,
                      description: `Buy ${p.name} with any other item and save!`,
                      type: "percentage",
                      value: "15",
                      applicableTo: "all",
                      minOrderValue: "0",
                      isActive: true,
                    });
                  }}
                  style={{ fontSize: "11px", fontWeight: 600, color: "#c9933a", background: "#fef9ec", border: "1px solid #f0d9a0", borderRadius: "999px", padding: "4px 12px", cursor: "pointer", flexShrink: 0 }}>
                  Create Deal
                </button>
              </div>
            ))}
          </div>
          {/* Popular combos */}
          <div style={{ background: "#F9F9FB", borderRadius: "14px", padding: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#0B1F3A", marginBottom: "4px" }}>Popular Pairings</p>
            <p style={{ fontSize: "12px", color: "#6E6E73", marginBottom: "16px" }}>Most frequently co-purchased products</p>
            {popularCombos.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Not enough order data yet</p>
            ) : popularCombos.map((pair, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#0B1F3A", fontWeight: 500 }}>{pair.nameA} + {pair.nameB}</p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF" }}>Bought together {pair.count}×</p>
                </div>
                <button
                  onClick={() => {
                    const code = `PAIR-${pair.nameA.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 3)}-${pair.nameB.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 3)}`;
                    prefillAndOpen({
                      code,
                      description: `Special offer when you buy ${pair.nameA} and ${pair.nameB} together!`,
                      type: "percentage",
                      value: "10",
                      applicableTo: "all",
                      minOrderValue: "0",
                      isActive: true,
                    });
                  }}
                  style={{ fontSize: "11px", fontWeight: 600, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "999px", padding: "4px 12px", cursor: "pointer", flexShrink: 0 }}>
                  Promote
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
