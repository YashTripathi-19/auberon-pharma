"use client"

import { useState } from "react"
import { VisionCorrection } from "@/lib/eyeKnowledgeData"

interface Props {
  correction: VisionCorrection
  isSelected: boolean
  onSelect: () => void
  compareMode: boolean
}

export default function VisionCorrectionCard({
  correction, isSelected, onSelect, compareMode }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: `2px solid ${isSelected ? "#c9933a" : "#e5e7eb"}`,
        overflow: "hidden",
        transition: "all 0.3s",
        boxShadow: isSelected
          ? "0 8px 32px rgba(201,147,58,0.15)"
          : "0 2px 8px rgba(0,0,0,0.06)"
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          background: isSelected ? "#1a2744" : "#f9fafb",
          cursor: "pointer",
          transition: "background 0.3s"
        }}
        onClick={onSelect}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 32 }}>{correction.icon}</span>
            <div>
              <h3 style={{
                color: isSelected ? "white" : "#1a2744",
                fontSize: 16,
                fontWeight: 700,
                margin: 0,
                marginBottom: 4
              }}>
                {correction.name}
              </h3>
              <p style={{
                color: isSelected ? "rgba(255,255,255,0.6)" : "#6b7280",
                fontSize: 12,
                margin: 0
              }}>
                {correction.costRange}
              </p>
            </div>
          </div>
          {compareMode && (
            <div style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: `2px solid ${isSelected ? "#c9933a" : "#d1d5db"}`,
              background: isSelected ? "#c9933a" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              {isSelected && (
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <polyline
                    points="1,5 4,8 9,2"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px" }}>
        <p style={{
          color: "#374151",
          fontSize: 13,
          lineHeight: 1.6,
          marginBottom: 16
        }}>
          {correction.description}
        </p>

        {/* How it works */}
        <div style={{
          background: "#f0f4ff",
          borderRadius: 10,
          padding: 14,
          marginBottom: 16,
          borderLeft: "3px solid #1a2744"
        }}>
          <p style={{
            color: "#1a2744",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.1em",
            marginBottom: 6
          }}>
            HOW IT WORKS
          </p>
          <p style={{ color: "#374151", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            {correction.howItWorks}
          </p>
        </div>

        {/* Pros and Cons side by side */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16
        }}>
          {/* Pros */}
          <div style={{
            background: "#f0fdf4",
            borderRadius: 10,
            padding: 14
          }}>
            <p style={{
              color: "#16a34a",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.08em",
              marginBottom: 10
            }}>
              ✓ ADVANTAGES
            </p>
            {correction.pros.slice(0, expanded ? undefined : 3).map((pro, i) => (
              <div key={i} style={{
                display: "flex",
                gap: 8,
                marginBottom: 6,
                alignItems: "flex-start"
              }}>
                <span style={{ color: "#16a34a", fontSize: 12, marginTop: 2 }}>+</span>
                <p style={{ color: "#374151", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                  {pro}
                </p>
              </div>
            ))}
          </div>

          {/* Cons */}
          <div style={{
            background: "#fff7f7",
            borderRadius: 10,
            padding: 14
          }}>
            <p style={{
              color: "#dc2626",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.08em",
              marginBottom: 10
            }}>
              ✗ LIMITATIONS
            </p>
            {correction.cons.slice(0, expanded ? undefined : 3).map((con, i) => (
              <div key={i} style={{
                display: "flex",
                gap: 8,
                marginBottom: 6,
                alignItems: "flex-start"
              }}>
                <span style={{ color: "#dc2626", fontSize: 12, marginTop: 2 }}>−</span>
                <p style={{ color: "#374151", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                  {con}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility */}
        {expanded && (
          <div style={{
            background: "#fffbeb",
            borderRadius: 10,
            padding: 14,
            marginBottom: 16,
            border: "1px solid #fde68a"
          }}>
            <p style={{
              color: "#92400e",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.08em",
              marginBottom: 10
            }}>
              ELIGIBILITY CRITERIA
            </p>
            {correction.eligibility.map((item, i) => (
              <div key={i} style={{
                display: "flex",
                gap: 8,
                marginBottom: 6,
                alignItems: "flex-start"
              }}>
                <span style={{ color: "#c9933a", fontSize: 12, marginTop: 2 }}>•</span>
                <p style={{ color: "#374151", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Duration */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 0",
          borderTop: "1px solid #f3f4f6"
        }}>
          <div>
            <p style={{
              color: "#9ca3af",
              fontSize: 11,
              margin: 0,
              marginBottom: 2,
              letterSpacing: "0.08em"
            }}>
              DURATION
            </p>
            <p style={{ color: "#1a2744", fontSize: 12, fontWeight: 600, margin: 0 }}>
              {correction.duration}
            </p>
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              background: "none",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 12,
              color: "#6b7280",
              cursor: "pointer"
            }}
          >
            {expanded ? "Show Less ↑" : "Show More ↓"}
          </button>
        </div>
      </div>
    </div>
  )
}
