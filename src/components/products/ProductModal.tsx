"use client";
import React, { useState } from "react";
import { Product } from "@/types/product";
import Modal from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";

const tabs = ["Overview", "Dosage & Usage", "Composition", "Side Effects"] as const;

export default function ProductModal({ product, isOpen, onClose }: { product: Product; isOpen: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<typeof tabs[number]>("Overview");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      {/* Top two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginBottom: "2.5rem" }}>

        {/* Visual */}
        <div style={{ background: "#F5F5F7", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "240px", padding: "2rem" }}>
          <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1rem", fontWeight: 600, color: "rgba(11,31,58,0.2)", textAlign: "center", lineHeight: 1.4 }}>
            {product.name}
          </p>
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "1rem" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9963E" }}>
            {product.category}
          </span>
          <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.2 }}>
            {product.name}
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", fontVariantNumeric: "tabular-nums" }}>
            {formatCurrency(product.price)}
          </p>
          <p style={{ fontSize: "13px", color: "#6E6E73" }}>
            Stock:{" "}
            <span style={{ fontWeight: 600, color: product.stock < 20 ? "#ef4444" : "#10b981" }}>
              {product.stock} units
            </span>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "0.25rem" }}>
            {product.tags.map((tag) => (
              <span key={tag} style={{ fontSize: "11px", color: "#6E6E73", background: "#F5F5F7", padding: "4px 10px", borderRadius: "999px" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0", overflowX: "auto" }}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "0.875rem 1.5rem",
                fontSize: "13px",
                fontWeight: 500,
                whiteSpace: "nowrap" as const,
                color: tab === t ? "#0B1F3A" : "#6E6E73",
                background: "none",
                border: "none",
                borderBottom: `2px solid ${tab === t ? "#0B1F3A" : "transparent"}`,
                cursor: "pointer",
                transition: "color 0.2s",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ minHeight: "160px" }}>
        {tab === "Overview" && (
          <p style={{ fontSize: "14px", color: "#6E6E73", lineHeight: "1.9" }}>{product.description}</p>
        )}
        {tab === "Dosage & Usage" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Dosage</p>
              <div style={{ background: "#EFF6FF", borderRadius: "0.75rem", padding: "1.25rem 1.5rem" }}>
                <p style={{ fontSize: "13px", color: "#0B1F3A", lineHeight: "1.9", whiteSpace: "pre-line" }}>{product.dosageInfo}</p>
              </div>
            </div>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Usage</p>
              <div style={{ background: "#F5F5F7", borderRadius: "0.75rem", padding: "1.25rem 1.5rem" }}>
                <p style={{ fontSize: "13px", color: "#0B1F3A", lineHeight: "1.9" }}>{product.usage}</p>
              </div>
            </div>
          </div>
        )}
        {tab === "Composition" && (
          <div style={{ background: "#F5F5F7", borderRadius: "0.75rem", padding: "1.25rem 1.5rem" }}>
            <p style={{ fontSize: "13px", color: "#0B1F3A", lineHeight: "1.9" }}>{product.composition}</p>
          </div>
        )}
        {tab === "Side Effects" && (
          <div style={{ background: "#FFFBEB", borderRadius: "0.75rem", padding: "1.25rem 1.5rem" }}>
            <p style={{ fontSize: "13px", color: "#0B1F3A", lineHeight: "1.9" }}>{product.sideEffects}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
