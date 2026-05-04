import React from "react";
import { cn } from "@/lib/utils";
import { formatCurrencyFull } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  accentColor?: string;
  rawAmount?: number; // when provided, shows full amount tooltip on hover
}

export default function KpiCard({ title, value, subtitle, icon: Icon, trend, accentColor = "bg-primary/5 text-primary", rawAmount }: KpiCardProps) {
  const isCurrency = typeof value === "string" && value.startsWith("Rs.");

  return (
    <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "28px 28px 24px" }}
      className="hover:shadow-sm transition-shadow">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1.5, maxWidth: "80px" }}>{title}</p>
        <div className={cn("rounded-xl flex items-center justify-center shrink-0", accentColor)} style={{ width: "44px", height: "44px" }}>
          <Icon size={18} strokeWidth={1.5} />
        </div>
      </div>

      {isCurrency && rawAmount !== undefined ? (
        <div className="kpi-tooltip-wrapper" style={{ position: "relative", display: "inline-block" }}>
          <p className="font-numeric" style={{ fontSize: "2.4rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1, cursor: "default" }}>{value}</p>
          <span className="kpi-tooltip">{formatCurrencyFull(rawAmount)}</span>
        </div>
      ) : typeof value === "string" && !/^[₹\d]/.test(value) ? (
        <p style={{ fontSize: "1.3rem", fontWeight: 600, color: "#0B1F3A", lineHeight: 1.2, fontFamily: "var(--font-body)" }}>{value}</p>
      ) : (
        <p className="font-numeric" style={{ fontSize: "2.4rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1 }}>{value}</p>
      )}

      {subtitle && (
        <p className={cn("mt-3", trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : subtitle.startsWith("-") ? "text-red-400" : "text-muted")}
          style={{ fontSize: "12px", marginTop: "12px" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
