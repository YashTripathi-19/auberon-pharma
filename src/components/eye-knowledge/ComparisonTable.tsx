"use client"

import { VisionCorrection } from "@/lib/eyeKnowledgeData"

interface Props {
  corrections: VisionCorrection[]
}

export default function ComparisonTable({ corrections }: Props) {
  if (corrections.length < 2) {
    return (
      <div style={{
        textAlign: "center",
        padding: 40,
        color: "#9ca3af",
        fontSize: 14
      }}>
        Select at least 2 options above to compare them side by side
      </div>
    )
  }

  const rows = [
    { label: "Cost Range", key: "costRange" as const },
    { label: "Duration", key: "duration" as const },
  ]

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 13
      }}>
        <thead>
          <tr>
            <th style={{
              padding: "12px 16px",
              background: "#1a2744",
              color: "white",
              textAlign: "left",
              fontWeight: 600,
              borderRadius: "8px 0 0 0"
            }}>
              Feature
            </th>
            {corrections.map((c, i) => (
              <th key={c.id} style={{
                padding: "12px 16px",
                background: "#1a2744",
                color: "#c9933a",
                textAlign: "center",
                fontWeight: 600,
                borderRadius: i === corrections.length - 1 ? "0 8px 0 0" : "0"
              }}>
                {c.icon} {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.key} style={{
              background: ri % 2 === 0 ? "white" : "#f9fafb"
            }}>
              <td style={{
                padding: "12px 16px",
                color: "#374151",
                fontWeight: 600,
                borderBottom: "1px solid #f3f4f6"
              }}>
                {row.label}
              </td>
              {corrections.map(c => (
                <td key={c.id} style={{
                  padding: "12px 16px",
                  color: "#374151",
                  textAlign: "center",
                  borderBottom: "1px solid #f3f4f6"
                }}>
                  {c[row.key]}
                </td>
              ))}
            </tr>
          ))}
          {/* Pros row */}
          <tr style={{ background: "#f0fdf4" }}>
            <td style={{
              padding: "12px 16px",
              color: "#16a34a",
              fontWeight: 600,
              borderBottom: "1px solid #f3f4f6"
            }}>
              Key Advantage
            </td>
            {corrections.map(c => (
              <td key={c.id} style={{
                padding: "12px 16px",
                color: "#374151",
                textAlign: "center",
                fontSize: 12,
                borderBottom: "1px solid #f3f4f6"
              }}>
                {c.pros[0]}
              </td>
            ))}
          </tr>
          {/* Cons row */}
          <tr style={{ background: "#fff7f7" }}>
            <td style={{
              padding: "12px 16px",
              color: "#dc2626",
              fontWeight: 600,
              borderBottom: "1px solid #f3f4f6"
            }}>
              Main Limitation
            </td>
            {corrections.map(c => (
              <td key={c.id} style={{
                padding: "12px 16px",
                color: "#374151",
                textAlign: "center",
                fontSize: 12,
                borderBottom: "1px solid #f3f4f6"
              }}>
                {c.cons[0]}
              </td>
            ))}
          </tr>
          {/* Eligibility row */}
          <tr>
            <td style={{
              padding: "12px 16px",
              color: "#92400e",
              fontWeight: 600
            }}>
              Who It Suits
            </td>
            {corrections.map(c => (
              <td key={c.id} style={{
                padding: "12px 16px",
                color: "#374151",
                textAlign: "center",
                fontSize: 12
              }}>
                {c.eligibility[0]}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
