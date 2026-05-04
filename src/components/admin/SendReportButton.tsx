"use client";
import React, { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

export default function SendReportButton() {
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const handleSend = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cron/daily-report");
      if (!res.ok) throw new Error();
      addToast("success", "Daily report sent to auberon.pharma@gmail.com");
    } catch {
      addToast("error", "Report failed — check console");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: "7px",
        padding: "10px 18px", borderRadius: "999px",
        fontSize: "13px", fontWeight: 500,
        border: "1px solid rgba(0,0,0,0.12)",
        background: "transparent", cursor: loading ? "not-allowed" : "pointer",
        color: "#6E6E73", transition: "all 0.2s",
        opacity: loading ? 0.6 : 1, flexShrink: 0,
      }}
      className="hover:bg-black/[0.04] hover:text-primary transition-colors"
      aria-label="Send daily report"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
      {loading ? "Sending…" : "Send Report"}
    </button>
  );
}
