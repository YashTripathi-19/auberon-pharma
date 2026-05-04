"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Subscriber } from "@/types/subscriber";
import { useToastStore } from "@/store/toastStore";
import { ChevronDown, ChevronUp } from "lucide-react";

type FilterTab = "all" | "active" | "unsubscribed";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function SkeletonRow() {
  return (
    <tr>
      {[220, 120, 100, 90, 120].map((w, i) => (
        <td key={i} style={{ padding: "18px 20px" }}>
          <div className="animate-pulse bg-gray-100 rounded" style={{ height: "14px", width: `${w}px` }} />
        </td>
      ))}
    </tr>
  );
}

export default function AdminSubscribersPage() {
  const addToast = useToastStore((s) => s.addToast);
  const searchParams = useSearchParams();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // Email blast state
  const [blastOpen, setBlastOpen] = useState(false);
  const [blastSubject, setBlastSubject] = useState("");
  const [blastMessage, setBlastMessage] = useState("");
  const [blastRecipients, setBlastRecipients] = useState<"all" | "customers" | "wholesalers" | "clinics" | "subscribers-only" | "custom">("all");
  const [blastCustomList, setBlastCustomList] = useState("");
  const [blastSending, setBlastSending] = useState(false);
  const [estimatedReach, setEstimatedReach] = useState<number | null>(null);
  const [reachLoading, setReachLoading] = useState(false);

  // Pre-fill from coupon page redirect
  useEffect(() => {
    const subject = searchParams.get("subject");
    const message = searchParams.get("message");
    const role = searchParams.get("role") as "all" | "customers" | "wholesalers" | "clinics" | "subscribers-only" | null;
    if (subject || message) {
      setBlastOpen(true);
      try { if (subject) setBlastSubject(decodeURIComponent(subject)); } catch { if (subject) setBlastSubject(subject); }
      try { if (message) setBlastMessage(decodeURIComponent(message)); } catch { if (message) setBlastMessage(message); }
      if (role) setBlastRecipients(role);
    }
  }, [searchParams]);

  // Fetch estimated reach when recipient selector changes
  useEffect(() => {
    if (blastRecipients === "custom") { setEstimatedReach(null); return; }
    setReachLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/subscribers/count-by-role?role=${blastRecipients}`);
        if (res.ok) { const data = await res.json(); setEstimatedReach(data.count); }
      } catch { /* silent */ }
      finally { setReachLoading(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [blastRecipients]);

  const fetchSubscribers = useCallback(async () => {    setLoading(true);
    const res = await fetch("/api/admin/subscribers");
    const data = await res.json();
    setSubscribers(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const handleToggleStatus = async (sub: Subscriber) => {
    const newStatus = !sub.isActive;
    const res = await fetch(`/api/admin/subscribers/${sub.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: newStatus }),
    });
    if (res.ok) {
      setSubscribers((prev) => prev.map((s) => s.id === sub.id ? { ...s, isActive: newStatus } : s));
    } else {
      addToast("error", "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this subscriber?")) return;
    const res = await fetch(`/api/admin/subscribers/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      addToast("success", "Subscriber deleted");
    } else {
      addToast("error", "Failed to delete");
    }
  };

  const handleSendBlast = async () => {
    if (!blastSubject.trim() || !blastMessage.trim()) {
      addToast("error", "Subject and message are required");
      return;
    }
    setBlastSending(true);
    try {
      const recipients = blastRecipients === "custom"
        ? blastCustomList.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean)
        : blastRecipients;

      const res = await fetch("/api/admin/subscribers/email-blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: blastSubject, message: blastMessage, recipients }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      addToast("success", `Sent: ${data.sent}, Failed: ${data.failed}, Total: ${data.totalRecipients}`);
      setBlastSubject("");
      setBlastMessage("");
      setBlastCustomList("");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to send blast");
    } finally {
      setBlastSending(false);
    }
  };

  const filtered =
    activeTab === "all"
      ? subscribers
      : activeTab === "active"
      ? subscribers.filter((s) => s.isActive)
      : subscribers.filter((s) => !s.isActive);

  const total = subscribers.length;
  const activeCount = subscribers.filter((s) => s.isActive).length;
  const unsubscribedCount = subscribers.filter((s) => !s.isActive).length;

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: total },
    { key: "active", label: "Active", count: activeCount },
    { key: "unsubscribed", label: "Unsubscribed", count: unsubscribedCount },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", fontSize: "13px", color: "#0B1F3A",
    border: "1px solid rgba(0,0,0,0.1)", borderRadius: "10px", outline: "none",
    background: "white", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* Page header */}
      <div style={{ paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.1 }}>Newsletter Subscribers</h1>
            <p style={{ fontSize: "14px", color: "#6E6E73", marginTop: "6px" }}>Manage your subscriber list and push communications</p>
          </div>
          {/* Stat chips */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { label: "Total", value: total, bg: "#F5F5F7", color: "#0B1F3A" },
              { label: "Active", value: activeCount, bg: "#f0fdf4", color: "#16a34a" },
              { label: "Unsubscribed", value: unsubscribedCount, bg: "#F5F5F7", color: "#6E6E73" },
            ].map((chip) => (
              <div key={chip.label} style={{ display: "flex", alignItems: "center", gap: "6px", background: chip.bg, borderRadius: "999px", padding: "6px 14px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: chip.color }}>{chip.value}</span>
                <span style={{ fontSize: "11px", color: "#6E6E73", fontWeight: 500 }}>{chip.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px", borderRadius: "999px", fontSize: "13px", fontWeight: 500,
              display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
              border: activeTab === tab.key ? "none" : "1px solid rgba(0,0,0,0.08)",
              background: activeTab === tab.key ? "#0B1F3A" : "white",
              color: activeTab === tab.key ? "white" : "#6E6E73",
              transition: "all 0.2s",
            }}
          >
            <span>{tab.label}</span>
            <span style={{
              fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px",
              background: activeTab === tab.key ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.06)",
              color: activeTab === tab.key ? "white" : "#6E6E73",
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Subscribers table">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#F5F5F7" }}>
                {["Email", "Subscribed On", "Source", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "16px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>{[1, 2, 3].map((i) => <SkeletonRow key={i} />)}</>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "64px 20px", fontSize: "14px", color: "#6E6E73" }}>
                    No subscribers yet
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }} className="hover:bg-[#F5F5F7] transition-colors">
                    <td style={{ padding: "18px 20px", fontSize: "13px", fontWeight: 500, color: "#0B1F3A" }}>{sub.email}</td>
                    <td style={{ padding: "18px 20px", fontSize: "13px", color: "#6E6E73", whiteSpace: "nowrap" }}>{formatDate(sub.subscribedAt)}</td>
                    <td style={{ padding: "18px 20px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px", background: sub.source === "Newsletter → Signup" ? "#0d9488" : sub.source === "Signup" ? "#0B1F3A" : "#F5F5F7", color: sub.source === "Newsletter → Signup" ? "white" : sub.source === "Signup" ? "white" : "#6E6E73", whiteSpace: "nowrap" }}>
                        {sub.source === "Newsletter → Signup" ? "Converted" : sub.source === "Signup" ? "Signup" : "Newsletter"}
                      </span>
                    </td>
                    <td style={{ padding: "18px 20px" }}>
                      <span style={{
                        fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px",
                        background: sub.isActive ? "#f0fdf4" : "#F5F5F7",
                        color: sub.isActive ? "#16a34a" : "#6E6E73",
                        whiteSpace: "nowrap",
                      }}>
                        {sub.isActive ? "Active" : "Unsubscribed"}
                      </span>
                    </td>
                    <td style={{ padding: "18px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button
                          onClick={() => handleToggleStatus(sub)}
                          style={{ fontSize: "12px", fontWeight: 500, color: "#0B1F3A", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          className="hover:opacity-70 transition-opacity"
                        >
                          {sub.isActive ? "Deactivate" : "Reactivate"}
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          style={{ fontSize: "12px", fontWeight: 500, color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          className="hover:opacity-70 transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Blast panel */}
      <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <button
          onClick={() => setBlastOpen((v) => !v)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px", background: "none", border: "none", cursor: "pointer",
            fontSize: "14px", fontWeight: 600, color: "#0B1F3A",
          }}
          aria-expanded={blastOpen}
        >
          <span>Send Email Blast</span>
          {blastOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {blastOpen && (
          <div style={{ padding: "0 24px 28px", display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ paddingTop: "20px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Subject</label>
              <input
                value={blastSubject}
                onChange={(e) => setBlastSubject(e.target.value)}
                placeholder="Email subject line"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Message</label>
              <textarea
                value={blastMessage}
                onChange={(e) => setBlastMessage(e.target.value)}
                placeholder="Write your message here..."
                rows={5}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Recipients</label>
              <select value={blastRecipients} onChange={(e) => setBlastRecipients(e.target.value as typeof blastRecipients)}
                style={{ width: "100%", padding: "10px 14px", fontSize: "13px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "10px", outline: "none", background: "white", color: "#0B1F3A" }}>
                <option value="all">All (Subscribers + Registered Users)</option>
                <option value="customers">Customers only</option>
                <option value="wholesalers">Wholesalers only</option>
                <option value="clinics">Clinics only</option>
                <option value="subscribers-only">Newsletter Subscribers only</option>
                <option value="custom">Custom email list</option>
              </select>
              {blastRecipients !== "custom" && (
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "6px" }}>
                  {reachLoading ? "Calculating reach…" : estimatedReach !== null ? `Estimated reach: ${estimatedReach} recipient${estimatedReach !== 1 ? "s" : ""}` : ""}
                </p>
              )}
            </div>
            {blastRecipients === "custom" && (
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Email addresses (comma or newline separated)</label>
                <textarea value={blastCustomList} onChange={(e) => setBlastCustomList(e.target.value)} placeholder="user1@example.com, user2@example.com" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
            )}
            <div>
              <button
                onClick={handleSendBlast}
                disabled={blastSending}
                className="btn-primary btn-gold"
                style={{ fontSize: "14px", padding: "12px 28px", opacity: blastSending ? 0.6 : 1 }}
              >
                {blastSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
