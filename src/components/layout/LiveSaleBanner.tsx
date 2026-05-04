"use client";
import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface LiveSale {
  isActive: boolean;
  title: string;
  subtitle: string;
  discountPercentage: number;
  applicableTo: string;
  endsAt: string | null;
  bannerColor: "gold" | "navy" | "red";
  showCountdown: boolean;
}

const BG: Record<string, string> = {
  gold: "#c9933a",
  navy: "#1a2744",
  red: "#dc2626",
};

function useCountdown(endsAt: string | null) {
  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    if (!endsAt) { setRemaining(null); return; }
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("00:00:00"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return remaining;
}

export default function LiveSaleBanner({ onDismiss }: { onDismiss?: () => void }) {
  const [sale, setSale] = useState<LiveSale | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const countdown = useCountdown(sale?.endsAt || null);

  const fetchSale = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/live-sale");
      if (res.ok) setSale(await res.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchSale();
    // Check sessionStorage dismissal
    if (sessionStorage.getItem("liveSaleDismissed") === "true") setDismissed(true);
  }, [fetchSale]);

  // Auto-deactivate when countdown hits zero
  useEffect(() => {
    if (countdown === "00:00:00" && sale?.isActive) {
      fetch("/api/admin/settings/live-sale", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sale, isActive: false }),
      }).catch(() => {});
      setSale((s) => s ? { ...s, isActive: false } : s);
    }
  }, [countdown, sale]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("liveSaleDismissed", "true");
    onDismiss?.();
  };

  if (!sale?.isActive || dismissed) return null;

  const bg = BG[sale.bannerColor] || BG.gold;

  return (
    <div style={{ background: bg, height: "44px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", width: "100%" }}>
      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "white", textAlign: "center", padding: "0 48px" }}>
        {sale.title} — {sale.subtitle}
        {sale.discountPercentage > 0 && ` · ${sale.discountPercentage}% off`}
        {sale.showCountdown && countdown && countdown !== "00:00:00" && (
          <span style={{ marginLeft: "16px", fontFamily: "monospace", fontWeight: 700 }}>Ends in: {countdown}</span>
        )}
      </p>
      <button onClick={handleDismiss} style={{ position: "absolute", right: "16px", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center" }} aria-label="Dismiss sale banner">
        <X size={16} />
      </button>
    </div>
  );
}
