"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Contact } from "@/types/order";
import { useToastStore } from "@/store/toastStore";
import { ChevronDown, ChevronUp, Mail } from "lucide-react";

const SUBJECT_TABS = ["all", "General Inquiry", "Order Support", "Product Information", "Partnership / Distribution", "Complaint"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function SkeletonRow() {
  return (
    <tr>
      {[140, 180, 100, 120, 200, 100, 80].map((w, i) => (
        <td key={i} style={{ padding: "18px 20px" }}>
          <div className="animate-pulse bg-gray-100 rounded" style={{ height: "14px", width: `${w}px` }} />
        </td>
      ))}
    </tr>
  );
}

// Dispatch event so sidebar can update its unread badge count
function notifyRead() {
  window.dispatchEvent(new CustomEvent("contact-read"));
}

export default function AdminContactsPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/contacts");
    const data = await res.json();
    setContacts(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const markAsRead = useCallback((id: string) => {
    setContacts((prev) => {
      const contact = prev.find((c) => c.id === id);
      if (!contact || contact.isRead) return prev;
      // Fire and forget
      fetch(`/api/admin/contacts/${id}`, { method: "PATCH" }).catch(() => {});
      notifyRead();
      return prev.map((c) => c.id === id ? { ...c, isRead: true } : c);
    });
  }, []);

  const handleToggleExpand = (id: string) => {
    const isOpening = expanded !== id;
    setExpanded(isOpening ? id : null);
    if (isOpening) markAsRead(id);
  };

  const filtered = activeTab === "all" ? contacts : contacts.filter((c) => c.subject === activeTab);

  const tabCounts = SUBJECT_TABS.reduce((acc, t) => {
    acc[t] = t === "all" ? contacts.length : contacts.filter((c) => c.subject === t).length;
    return acc;
  }, {} as Record<string, number>);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this contact entry?")) return;
    const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (expanded === id) setExpanded(null);
      addToast("success", "Contact deleted");
      notifyRead(); // badge may need to update if deleted contact was unread
    } else {
      addToast("error", "Failed to delete");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* Page header */}
      <div style={{ paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.1 }}>Contacts & Inquiries</h1>
        <p style={{ fontSize: "14px", color: "#6E6E73", marginTop: "6px" }}>Customer messages and support requests</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {SUBJECT_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px", borderRadius: "999px", fontSize: "13px", fontWeight: 500,
              display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
              border: activeTab === tab ? "none" : "1px solid rgba(0,0,0,0.08)",
              background: activeTab === tab ? "#0B1F3A" : "white",
              color: activeTab === tab ? "white" : "#6E6E73",
              transition: "all 0.2s",
            }}
            aria-label={`Filter by ${tab}`}
          >
            <span>{tab === "all" ? "All" : tab}</span>
            <span style={{
              fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px",
              background: activeTab === tab ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.06)",
              color: activeTab === tab ? "white" : "#6E6E73",
            }}>
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Contacts table">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#F5F5F7" }}>
                {["Name", "Email", "Phone", "Subject", "Message", "Date", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "16px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>{[1, 2, 3].map((i) => <SkeletonRow key={i} />)}</>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "64px 20px", fontSize: "14px", color: "#6E6E73" }}>
                    No inquiries found
                  </td>
                </tr>
              ) : (
                filtered.map((contact) => (
                  <React.Fragment key={contact.id}>
                    <tr
                      style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                      className="hover:bg-[#F5F5F7] transition-colors"
                    >
                      {/* Name with unread dot */}
                      <td style={{ padding: "18px 20px", fontSize: "13px", fontWeight: 500, color: "#0B1F3A", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {!contact.isRead && (
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C9963E", flexShrink: 0, display: "inline-block" }} aria-label="Unread" />
                          )}
                          {contact.name}
                        </div>
                      </td>
                      <td style={{ padding: "18px 20px", fontSize: "13px", color: "#6E6E73" }}>{contact.email}</td>
                      <td style={{ padding: "18px 20px", fontSize: "13px", color: "#6E6E73", whiteSpace: "nowrap" }}>{contact.phone || "—"}</td>
                      <td style={{ padding: "18px 20px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px", background: "#F5F5F7", color: "#6E6E73", whiteSpace: "nowrap" }}>
                          {contact.subject}
                        </span>
                      </td>
                      <td style={{ padding: "18px 20px", fontSize: "13px", color: "#6E6E73", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {contact.message.length > 60 ? contact.message.slice(0, 60) + "…" : contact.message}
                      </td>
                      <td style={{ padding: "18px 20px", fontSize: "11px", color: "#6E6E73", whiteSpace: "nowrap" }}>{formatDate(contact.createdAt)}</td>
                      <td style={{ padding: "18px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button
                            onClick={() => handleToggleExpand(contact.id)}
                            style={{ fontSize: "12px", fontWeight: 500, color: "#0B1F3A", background: "none", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                            className="hover:bg-[#F5F5F7] transition-colors"
                            aria-label={`View contact from ${contact.name}`}
                          >
                            {expanded === contact.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            style={{ fontSize: "12px", fontWeight: 500, color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: "6px 4px" }}
                            className="hover:opacity-70 transition-opacity"
                            aria-label={`Delete contact from ${contact.name}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {expanded === contact.id && (
                      <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", background: "#FAFAFA" }}>
                        <td colSpan={7} style={{ padding: "24px 28px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              {[
                                { label: "Full Name", value: contact.name },
                                { label: "Email", value: contact.email },
                                { label: "Phone", value: contact.phone || "Not provided" },
                                { label: "Subject", value: contact.subject },
                                { label: "Received", value: formatDate(contact.createdAt) },
                              ].map((item) => (
                                <div key={item.label}>
                                  <p style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>{item.label}</p>
                                  <p style={{ fontSize: "13px", color: "#0B1F3A" }}>{item.value}</p>
                                </div>
                              ))}
                            </div>
                            <div>
                              <p style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Message</p>
                              <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap", background: "white", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)" }}>
                                {contact.message}
                              </p>
                              <a
                                href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)} — Auberon Pharmaceuticals`}
                                onClick={() => markAsRead(contact.id)}
                                style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "16px", fontSize: "13px", fontWeight: 500, color: "white", background: "#C9963E", padding: "10px 20px", borderRadius: "999px", textDecoration: "none" }}
                              >
                                <Mail size={13} />
                                Reply via Email
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
