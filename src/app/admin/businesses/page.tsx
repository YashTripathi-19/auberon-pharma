"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useToastStore } from "@/store/toastStore";
import { ChevronDown, ChevronUp, AlertTriangle, Lock } from "lucide-react";
import { User, BusinessStatus } from "@/types/user";

type FilterTab = "all" | "pending" | "verified" | "restricted" | "rejected" | "banned" | "wholesaler" | "clinic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getStatus(u: User): BusinessStatus {
  return u.businessStatus || (u.isBusinessVerified ? "verified" : "pending");
}

const STATUS_STYLE: Record<BusinessStatus, { bg: string; color: string; label: string }> = {
  pending:    { bg: "#fffbeb", color: "#92400e", label: "Pending" },
  verified:   { bg: "#f0fdf4", color: "#16a34a", label: "Verified" },
  rejected:   { bg: "#fef2f2", color: "#dc2626", label: "Rejected" },
  restricted: { bg: "#fff7ed", color: "#c2410c", label: "Restricted" },
  banned:     { bg: "#fef2f2", color: "#7f1d1d", label: "Banned" },
};

function StatusBadge({ status }: { status: BusinessStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px", background: s.bg, color: s.color, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "4px" }}>
      {status === "banned" && <Lock size={10} />}
      {s.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[140, 180, 90, 140, 100, 90, 120].map((w, i) => (
        <td key={i} style={{ padding: "18px 20px" }}>
          <div className="animate-pulse bg-gray-100 rounded" style={{ height: "14px", width: `${w}px` }} />
        </td>
      ))}
    </tr>
  );
}

export default function AdminBusinessesPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionOpen, setActionOpen] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<Record<string, string>>({});
  const [actionStep, setActionStep] = useState<Record<string, "menu" | "restrict" | "ban" | "reject" | "rereview">>({}); 
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/businesses");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const doAction = async (userId: string, action: BusinessStatus, note?: string) => {
    setProcessing(userId);
    try {
      const res = await fetch(`/api/admin/businesses/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: note || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...data } : u));
      setActionOpen(null);
      setActionStep((p) => ({ ...p, [userId]: "menu" }));
      addToast("success", `Status updated to ${action}`);
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Action failed");
    } finally {
      setProcessing(false as unknown as string);
    }
  };

  const filtered = users.filter((u) => {
    const status = getStatus(u);
    if (activeTab === "pending") return status === "pending";
    if (activeTab === "verified") return status === "verified";
    if (activeTab === "restricted") return status === "restricted";
    if (activeTab === "rejected") return status === "rejected";
    if (activeTab === "banned") return status === "banned";
    if (activeTab === "wholesaler") return u.role === "wholesaler";
    if (activeTab === "clinic") return u.role === "clinic";
    return true;
  });

  const count = (tab: FilterTab) => {
    if (tab === "all") return users.length;
    if (tab === "wholesaler") return users.filter((u) => u.role === "wholesaler").length;
    if (tab === "clinic") return users.filter((u) => u.role === "clinic").length;
    return users.filter((u) => getStatus(u) === tab).length;
  };

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "verified", label: "Verified" },
    { key: "restricted", label: "Restricted" },
    { key: "rejected", label: "Rejected" },
    { key: "banned", label: "Banned" },
    { key: "wholesaler", label: "Wholesalers" },
    { key: "clinic", label: "Clinics" },
  ];

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", fontSize: "13px", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "10px", outline: "none", resize: "vertical" as const };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div style={{ paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.1 }}>Business Accounts</h1>
        <p style={{ fontSize: "14px", color: "#6E6E73", marginTop: "6px" }}>Verify and manage wholesaler and clinic registrations</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", border: activeTab === tab.key ? "none" : "1px solid rgba(0,0,0,0.08)", background: activeTab === tab.key ? "#0B1F3A" : "white", color: activeTab === tab.key ? "white" : "#6E6E73", transition: "all 0.2s" }}>
            <span>{tab.label}</span>
            <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 7px", borderRadius: "999px", background: activeTab === tab.key ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.06)", color: activeTab === tab.key ? "white" : "#6E6E73" }}>{count(tab.key)}</span>
          </button>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Business accounts table">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#F5F5F7" }}>
                {["Name", "Email", "Role", "Business Name", "Registered", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "16px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>{[1, 2, 3].map((i) => <SkeletonRow key={i} />)}</>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "64px 20px", fontSize: "14px", color: "#6E6E73" }}>No business accounts found</td></tr>
              ) : (
                filtered.map((user) => {
                  const status = getStatus(user);
                  const isBanned = status === "banned";
                  const step = actionStep[user.id] || "menu";
                  const isActionOpen = actionOpen === user.id;

                  return (
                    <React.Fragment key={user.id}>
                      <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", background: isBanned ? "rgba(220,38,38,0.04)" : undefined }} className={!isBanned ? "hover:bg-[#F5F5F7] transition-colors" : ""}>
                        <td style={{ padding: "18px 20px", fontSize: "13px", fontWeight: 500, color: "#0B1F3A" }}>{user.name}</td>
                        <td style={{ padding: "18px 20px", fontSize: "13px", color: "#6E6E73" }}>{user.email}</td>
                        <td style={{ padding: "18px 20px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px", background: user.role === "wholesaler" ? "#fef3c7" : "#e0f2fe", color: user.role === "wholesaler" ? "#92400e" : "#0369a1", whiteSpace: "nowrap" }}>
                            {user.role === "wholesaler" ? "Wholesaler" : "Clinic"}
                          </span>
                        </td>
                        <td style={{ padding: "18px 20px", fontSize: "13px", color: "#0B1F3A" }}>{user.businessName || user.institutionName || "—"}</td>
                        <td style={{ padding: "18px 20px", fontSize: "13px", color: "#6E6E73", whiteSpace: "nowrap" }}>{formatDate(user.createdAt)}</td>
                        <td style={{ padding: "18px 20px" }}><StatusBadge status={status} /></td>
                        <td style={{ padding: "18px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <button onClick={() => setExpanded(expanded === user.id ? null : user.id)}
                              style={{ fontSize: "12px", fontWeight: 500, color: "#0B1F3A", background: "none", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                              className="hover:bg-[#F5F5F7] transition-colors">
                              {expanded === user.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />} View
                            </button>

                            {/* Status-driven action buttons */}
                            {status === "pending" && (
                              <>
                                <button onClick={() => doAction(user.id, "verified")} disabled={processing === user.id}
                                  className="btn-primary btn-gold" style={{ fontSize: "12px", padding: "6px 14px", opacity: processing === user.id ? 0.6 : 1 }}>
                                  Verify
                                </button>
                                <button onClick={() => { setActionOpen(isActionOpen ? null : user.id); setActionStep((p) => ({ ...p, [user.id]: "reject" })); }}
                                  style={{ fontSize: "12px", fontWeight: 500, color: "#dc2626", background: "none", border: "1px solid #fecaca", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}
                                  className="hover:bg-red-50 transition-colors">
                                  Reject
                                </button>
                              </>
                            )}
                            {(status === "verified" || status === "restricted") && (
                              <button onClick={() => { setActionOpen(isActionOpen ? null : user.id); setActionStep((p) => ({ ...p, [user.id]: "menu" })); }}
                                style={{ fontSize: "12px", fontWeight: 500, color: "#c9933a", background: "none", border: "1px solid #f0d9a0", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}
                                className="hover:bg-amber-50 transition-colors">
                                Take Action
                              </button>
                            )}
                            {status === "rejected" && (
                              <button onClick={() => { setActionOpen(isActionOpen ? null : user.id); setActionStep((p) => ({ ...p, [user.id]: "rereview" })); }}
                                style={{ fontSize: "12px", fontWeight: 500, color: "#6E6E73", background: "none", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}
                                className="hover:bg-[#F5F5F7] transition-colors">
                                Take Action
                              </button>
                            )}
                            {isBanned && (
                              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Permanent — no actions available</span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Inline action panel */}
                      {isActionOpen && (
                        <tr style={{ background: "white", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                          <td colSpan={7} style={{ padding: "24px 28px", border: "1px solid #e5e7eb", borderLeft: "none", borderRight: "none" }}>

                            {/* REJECT panel */}
                            {step === "reject" && (
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                                  <AlertTriangle size={16} style={{ color: "#dc2626" }} />
                                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#dc2626" }}>Reject Account — {user.name}</p>
                                </div>
                                <textarea value={actionNote[user.id] || ""} onChange={(e) => setActionNote((p) => ({ ...p, [user.id]: e.target.value }))}
                                  placeholder="Reason for rejection (required — sent to user)" rows={3} style={{ ...inputStyle, borderColor: "rgba(220,38,38,0.3)", marginBottom: "12px" }} />
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button onClick={() => doAction(user.id, "rejected", actionNote[user.id])} disabled={!actionNote[user.id]?.trim() || processing === user.id}
                                    style={{ padding: "9px 20px", borderRadius: "999px", background: "#dc2626", color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, opacity: !actionNote[user.id]?.trim() || processing === user.id ? 0.5 : 1 }}>
                                    {processing === user.id ? "Processing…" : "Confirm Rejection"}
                                  </button>
                                  <button onClick={() => setActionOpen(null)} style={{ padding: "9px 20px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.12)", background: "transparent", cursor: "pointer", fontSize: "13px", color: "#6E6E73", fontWeight: 500 }}>Cancel</button>
                                </div>
                              </div>
                            )}

                            {/* TAKE ACTION panel for verified/restricted */}
                            {step === "menu" && (status === "verified" || status === "restricted") && (
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                  <AlertTriangle size={16} style={{ color: "#c9933a" }} />
                                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#0B1F3A" }}>Take Action on {user.name}</p>
                                </div>
                                <p style={{ fontSize: "13px", color: "#6E6E73", marginBottom: "16px" }}>Currently: <StatusBadge status={status} /></p>
                                {/* History preview */}
                                {user.verificationHistory && user.verificationHistory.length > 0 && (
                                  <div style={{ marginBottom: "16px" }}>
                                    {user.verificationHistory.slice(-3).reverse().map((h, i) => (
                                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                                        <span style={{ fontSize: "11px", color: "#9CA3AF", whiteSpace: "nowrap" }}>{formatDateTime(h.timestamp)}</span>
                                        <StatusBadge status={h.action} />
                                        {h.note && <span style={{ fontSize: "12px", color: "#6E6E73" }}>{h.note}</span>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                  {status === "restricted" && (
                                    <button onClick={() => doAction(user.id, "verified")} disabled={processing === user.id}
                                      style={{ padding: "9px 20px", borderRadius: "999px", background: "#16a34a", color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
                                      Lift Restriction
                                    </button>
                                  )}
                                  {status === "verified" && (
                                    <button onClick={() => setActionStep((p) => ({ ...p, [user.id]: "restrict" }))}
                                      style={{ padding: "9px 20px", borderRadius: "999px", background: "#f97316", color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
                                      Restrict Account
                                    </button>
                                  )}
                                  <button onClick={() => setActionStep((p) => ({ ...p, [user.id]: "ban" }))}
                                    style={{ padding: "9px 20px", borderRadius: "999px", background: "#7f1d1d", color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
                                    Ban Account
                                  </button>
                                  <button onClick={() => setActionOpen(null)} style={{ padding: "9px 20px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.12)", background: "transparent", cursor: "pointer", fontSize: "13px", color: "#6E6E73", fontWeight: 500 }}>Cancel</button>
                                </div>
                              </div>
                            )}

                            {/* RESTRICT sub-panel */}
                            {step === "restrict" && (
                              <div>
                                <p style={{ fontSize: "14px", fontWeight: 600, color: "#f97316", marginBottom: "12px" }}>Restrict Account — {user.name}</p>
                                <textarea value={actionNote[user.id] || ""} onChange={(e) => setActionNote((p) => ({ ...p, [user.id]: e.target.value }))}
                                  placeholder="Reason for restriction (sent to user)" rows={3} style={{ ...inputStyle, borderColor: "rgba(249,115,22,0.3)", marginBottom: "12px" }} />
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button onClick={() => doAction(user.id, "restricted", actionNote[user.id])} disabled={processing === user.id}
                                    style={{ padding: "9px 20px", borderRadius: "999px", background: "#f97316", color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, opacity: processing === user.id ? 0.6 : 1 }}>
                                    {processing === user.id ? "Processing…" : "Confirm Restriction"}
                                  </button>
                                  <button onClick={() => setActionStep((p) => ({ ...p, [user.id]: "menu" }))} style={{ padding: "9px 20px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.12)", background: "transparent", cursor: "pointer", fontSize: "13px", color: "#6E6E73", fontWeight: 500 }}>Back</button>
                                </div>
                              </div>
                            )}

                            {/* BAN sub-panel */}
                            {step === "ban" && (
                              <div>
                                <p style={{ fontSize: "14px", fontWeight: 600, color: "#7f1d1d", marginBottom: "8px" }}>Ban Account — {user.name}</p>
                                <p style={{ fontSize: "13px", color: "#dc2626", marginBottom: "12px", fontWeight: 500 }}>⚠ This is permanent and cannot be undone.</p>
                                <textarea value={actionNote[user.id] || ""} onChange={(e) => setActionNote((p) => ({ ...p, [user.id]: e.target.value }))}
                                  placeholder="Reason for ban (sent to user)" rows={3} style={{ ...inputStyle, borderColor: "rgba(127,29,29,0.3)", marginBottom: "12px" }} />
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button onClick={() => doAction(user.id, "banned", actionNote[user.id])} disabled={processing === user.id}
                                    style={{ padding: "9px 20px", borderRadius: "999px", background: "#7f1d1d", color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, opacity: processing === user.id ? 0.6 : 1 }}>
                                    {processing === user.id ? "Processing…" : "Confirm Ban"}
                                  </button>
                                  <button onClick={() => setActionStep((p) => ({ ...p, [user.id]: "menu" }))} style={{ padding: "9px 20px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.12)", background: "transparent", cursor: "pointer", fontSize: "13px", color: "#6E6E73", fontWeight: 500 }}>Back</button>
                                </div>
                              </div>
                            )}

                            {/* RE-REVIEW panel for rejected */}
                            {step === "rereview" && (
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                  <AlertTriangle size={16} style={{ color: "#c9933a" }} />
                                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#0B1F3A" }}>Previously Rejected — {user.name}</p>
                                </div>
                                {user.verificationNote && (
                                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
                                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#92400e", marginBottom: "4px" }}>Rejection Reason:</p>
                                    <p style={{ fontSize: "13px", color: "#92400e" }}>{user.verificationNote}</p>
                                  </div>
                                )}
                                {user.verificationHistory && user.verificationHistory.length > 0 && (
                                  <div style={{ marginBottom: "16px" }}>
                                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>History</p>
                                    {user.verificationHistory.slice().reverse().map((h, i) => (
                                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                                        <span style={{ fontSize: "11px", color: "#9CA3AF", whiteSpace: "nowrap" }}>{formatDateTime(h.timestamp)}</span>
                                        <StatusBadge status={h.action} />
                                        {h.note && <span style={{ fontSize: "12px", color: "#6E6E73" }}>{h.note}</span>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button onClick={() => doAction(user.id, "pending")} disabled={processing === user.id}
                                    style={{ padding: "9px 20px", borderRadius: "999px", border: "1.5px solid #c9933a", background: "transparent", color: "#c9933a", cursor: "pointer", fontSize: "13px", fontWeight: 600, opacity: processing === user.id ? 0.6 : 1 }}>
                                    {processing === user.id ? "Processing…" : "Send for Re-Review"}
                                  </button>
                                  <button onClick={() => setActionOpen(null)} style={{ padding: "9px 20px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.12)", background: "transparent", cursor: "pointer", fontSize: "13px", color: "#6E6E73", fontWeight: 500 }}>Cancel</button>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}

                      {/* Expanded detail row */}
                      {expanded === user.id && (
                        <tr style={{ background: "#FAFAFA", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                          <td colSpan={7} style={{ padding: "24px 28px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                              {[
                                { label: "Full Name", value: user.name },
                                { label: "Email", value: user.email },
                                { label: "Phone", value: user.phone },
                                { label: "Role", value: user.role === "wholesaler" ? "Wholesaler / Distributor" : "Hospital / Doctor / Clinic" },
                                { label: "Business Name", value: user.businessName || user.institutionName || "—" },
                                { label: "Business Address", value: user.businessAddress || "—" },
                                ...(user.role === "wholesaler" ? [{ label: "GST Number", value: user.gstNumber || "—" }] : []),
                                ...(user.role === "clinic" ? [
                                  { label: "Doctor Reg. No.", value: user.doctorRegNumber || "—" },
                                  { label: "Specialisation", value: user.specialisation || "—" },
                                  { label: "Institution Type", value: user.institutionType || "—" },
                                ] : []),
                                { label: "Registered On", value: formatDate(user.createdAt) },
                                ...(user.verificationNote ? [{ label: "Current Note", value: user.verificationNote }] : []),
                              ].map((item) => (
                                <div key={item.label}>
                                  <p style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>{item.label}</p>
                                  <p style={{ fontSize: "13px", color: "#0B1F3A" }}>{item.value}</p>
                                </div>
                              ))}
                            </div>

                            {/* Verification History */}
                            <div>
                              <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Verification History</p>
                              {!user.verificationHistory || user.verificationHistory.length === 0 ? (
                                <p style={{ fontSize: "13px", color: "#9CA3AF" }}>No history yet</p>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                                  {user.verificationHistory.slice().reverse().map((h, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "10px 0", borderBottom: i < user.verificationHistory!.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                                      <span style={{ fontSize: "11px", color: "#9CA3AF", whiteSpace: "nowrap", minWidth: "120px" }}>{formatDateTime(h.timestamp)}</span>
                                      <StatusBadge status={h.action} />
                                      {h.note && <span style={{ fontSize: "12px", color: "#6E6E73", flex: 1 }}>{h.note}</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
