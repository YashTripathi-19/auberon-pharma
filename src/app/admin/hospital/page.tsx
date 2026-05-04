"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Appointment } from "@/types/appointment";
import { useToastStore } from "@/store/toastStore";
import { formatDate } from "@/lib/utils";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToggleLeft, ToggleRight } from "lucide-react";

type StatusFilter = "all" | "requested" | "confirmed" | "cancelled" | "completed";

const STATUS_STYLE: Record<string, string> = {
  requested: "bg-amber-50 text-amber-600",
  confirmed: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-blue-50 text-blue-700",
};

export default function AdminHospitalPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Visibility settings
  const [visibility, setVisibility] = useState({ isPublic: false, showInNav: false, showHomeTeaser: false, showSupportCard: false });
  const [savingVis, setSavingVis] = useState(false);

  useEffect(() => {
    fetch("/api/settings/hospital-visibility").then((r) => r.ok ? r.json() : null).then((d) => { if (d) setVisibility(d); }).catch(() => {});
  }, []);

  const handleSaveVisibility = async () => {
    setSavingVis(true);
    try {
      const res = await fetch("/api/admin/settings/hospital-visibility", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(visibility) });
      if (!res.ok) throw new Error();
      addToast("success", "Visibility settings updated");
    } catch { addToast("error", "Failed to save"); }
    finally { setSavingVis(false); }
  };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/hospital/appointments");
    if (res.ok) setAppointments(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/hospital/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setAppointments((prev) => prev.map((a) => a.id === id ? updated : a));
      addToast("success", `Status updated to ${status}`);
    } else {
      addToast("error", "Failed to update status");
    }
  };

  const filtered = activeTab === "all" ? appointments : appointments.filter((a) => a.status === activeTab);
  const count = (s: StatusFilter) => s === "all" ? appointments.length : appointments.filter((a) => a.status === s).length;

  const TABS: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "requested", label: "Requested" },
    { key: "confirmed", label: "Confirmed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Visibility Settings Card */}
      <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <Eye size={18} style={{ color: "#c9933a" }} />
          <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#0B1F3A" }}>Site Visibility</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {([
            { key: "isPublic", label: "Hospital Wing Public", desc: "When off, /hospital redirects to home" },
            { key: "showInNav", label: "Show Hospital in Navigation", desc: "Controls navbar and footer link" },
            { key: "showHomeTeaser", label: "Show Home Page Teaser", desc: "Hospital teaser section on home page" },
            { key: "showSupportCard", label: "Show on Support Page", desc: "Hospital appointments card on support page" },
          ] as const).map((item) => (
            <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#F9F9FB", borderRadius: "12px" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#0B1F3A" }}>{item.label}</p>
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{item.desc}</p>
              </div>
              <button type="button" onClick={() => setVisibility((v) => ({ ...v, [item.key]: !v[item.key] }))}
                style={{ background: "none", border: "none", cursor: "pointer", color: visibility[item.key] ? "#16a34a" : "#9CA3AF" }}>
                {visibility[item.key] ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
          ))}
        </div>
        <button onClick={handleSaveVisibility} disabled={savingVis} className="btn-primary btn-gold" style={{ fontSize: "13px", padding: "11px 28px", marginTop: "20px", opacity: savingVis ? 0.6 : 1 }}>
          {savingVis ? "Saving…" : "Save Visibility Settings"}
        </button>
      </div>

      {/* Header */}
      <div style={{ paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.1 }}>Hospital Wing</h1>
        <p style={{ fontSize: "14px", color: "#6E6E73", marginTop: "6px" }}>Manage appointments and hospital settings</p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {[
          { label: "Total", value: appointments.length, color: "#0B1F3A" },
          { label: "Requested", value: count("requested"), color: "#92400e" },
          { label: "Confirmed", value: count("confirmed"), color: "#16a34a" },
          { label: "Completed", value: count("completed"), color: "#2563eb" },
        ].map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.06)", padding: "16px 24px", display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "22px", fontWeight: 700, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: "12px", color: "#6E6E73" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: activeTab === t.key ? "none" : "1px solid rgba(0,0,0,0.08)", background: activeTab === t.key ? "#0B1F3A" : "white", color: activeTab === t.key ? "white" : "#6E6E73", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" }}>
            {t.label}
            <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 7px", borderRadius: "999px", background: activeTab === t.key ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.06)", color: activeTab === t.key ? "white" : "#6E6E73" }}>{count(t.key)}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Appointments table">
            <thead>
              <tr style={{ background: "#F5F5F7", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                {["Name", "Email", "Phone", "Service", "Doctor", "Date & Time", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "48px", color: "#6E6E73" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "48px", fontSize: "14px", color: "#6E6E73" }}>No appointments found</td></tr>
              ) : filtered.map((apt) => (
                <React.Fragment key={apt.id}>
                  <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }} className="hover:bg-[#F5F5F7] transition-colors">
                    <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 500, color: "#0B1F3A" }}>{apt.name}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6E6E73" }}>{apt.email}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6E6E73" }}>{apt.phone}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#0B1F3A" }}>{apt.service}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6E6E73" }}>{apt.doctorName || "—"}</td>
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "#6E6E73", whiteSpace: "nowrap" }}>{apt.preferredDate} {apt.preferredTime}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span className={cn("text-[11px] font-semibold px-3 py-1.5 rounded-full capitalize", STATUS_STYLE[apt.status] || "bg-gray-100 text-gray-600")}>
                        {apt.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <select value={apt.status} onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                          className={cn("text-[11px] font-semibold px-2 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none capitalize", STATUS_STYLE[apt.status] || "bg-gray-100 text-gray-600")}
                          aria-label={`Status for ${apt.id}`}>
                          <option value="requested">Requested</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button onClick={() => setExpanded(expanded === apt.id ? null : apt.id)}
                          style={{ width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }}
                          className="hover:bg-black/[0.06]">
                          {expanded === apt.id ? <ChevronUp size={13} style={{ color: "#6E6E73" }} /> : <ChevronDown size={13} style={{ color: "#6E6E73" }} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === apt.id && (
                    <tr style={{ background: "#FAFAFA", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                      <td colSpan={8} style={{ padding: "20px 24px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                          {[
                            { label: "Appointment ID", value: apt.id },
                            { label: "Service", value: apt.service },
                            { label: "Doctor", value: apt.doctorName || "No preference" },
                            { label: "Date", value: apt.preferredDate },
                            { label: "Time", value: apt.preferredTime },
                            { label: "Booked On", value: formatDate(apt.createdAt) },
                            ...(apt.notes ? [{ label: "Notes", value: apt.notes }] : []),
                          ].map((item) => (
                            <div key={item.label}>
                              <p style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>{item.label}</p>
                              <p style={{ fontSize: "13px", color: "#0B1F3A" }}>{item.value}</p>
                            </div>
                          ))}
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
    </div>
  );
}
