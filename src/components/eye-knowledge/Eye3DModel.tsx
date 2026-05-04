"use client"

import { useEffect, useRef, useState } from "react"

interface Eye3DModelProps {
  highlightPart?: "cornea" | "lens" | "retina" | "conjunctiva" | "iris" | "optic-nerve" | null
  condition?: string | null
}

export default function Eye3DModel({ highlightPart, condition }: Eye3DModelProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null)
  const [rotating, setRotating] = useState(true)
  const [rotation, setRotation] = useState(0)
  const animRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!rotating) return
    const animate = () => {
      setRotation(r => (r + 0.3) % 360)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [rotating])

  const parts = [
    { id: "conjunctiva", label: "Conjunctiva", x: 150, y: 80, desc: "Thin transparent membrane covering the white of the eye" },
    { id: "cornea", label: "Cornea", x: 150, y: 130, desc: "Clear dome-shaped surface that covers the front of the eye" },
    { id: "iris", label: "Iris", x: 110, y: 155, desc: "Coloured ring that controls pupil size and light entry" },
    { id: "lens", label: "Lens", x: 160, y: 160, desc: "Flexible transparent structure that focuses light onto retina" },
    { id: "retina", label: "Retina", x: 220, y: 155, desc: "Light-sensitive layer at the back that converts light to signals" },
    { id: "optic-nerve", label: "Optic Nerve", x: 240, y: 175, desc: "Transmits visual signals from retina to the brain" }
  ]

  const getPartColor = (partId: string) => {
    if (condition === "conjunctivitis" && partId === "conjunctiva") return "#dc2626"
    if (condition === "cataract" && partId === "lens") return "#9ca3af"
    if (condition === "myopia" && partId === "cornea") return "#2563eb"
    if (condition === "hyperopia" && partId === "lens") return "#16a34a"
    if (highlightPart === partId || hoveredPart === partId) return "#c9933a"
    return null
  }

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{ display: "inline-block", cursor: "pointer", position: "relative" }}
        onClick={() => setRotating(r => !r)}
        title={rotating ? "Click to pause rotation" : "Click to resume rotation"}
      >
        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          style={{
            filter: "drop-shadow(0 8px 32px rgba(26,39,68,0.18))",
            transform: `rotateY(${rotating ? rotation : 0}deg)`,
            transition: rotating ? "none" : "transform 0.3s"
          }}
        >
          {/* Outer sclera — white of eye */}
          <ellipse cx="150" cy="155" rx="120" ry="100"
            fill={getPartColor("conjunctiva") || "#f8f4f0"}
            stroke="#e0d5c8" strokeWidth="2"
            onMouseEnter={() => setHoveredPart("conjunctiva")}
            onMouseLeave={() => setHoveredPart(null)}
            style={{ cursor: "pointer", transition: "fill 0.3s" }}
          />

          {/* Cornea — clear dome */}
          <ellipse cx="150" cy="130" rx="55" ry="45"
            fill={getPartColor("cornea") ? `${getPartColor("cornea")}33` : "rgba(200,230,255,0.45)"}
            stroke={getPartColor("cornea") || "#93c5fd"}
            strokeWidth={getPartColor("cornea") ? 3 : 1.5}
            onMouseEnter={() => setHoveredPart("cornea")}
            onMouseLeave={() => setHoveredPart(null)}
            style={{ cursor: "pointer", transition: "all 0.3s" }}
          />

          {/* Iris */}
          <circle cx="150" cy="155" r="42"
            fill={getPartColor("iris") || "#3b6fa0"}
            stroke={getPartColor("iris") ? "#c9933a" : "#1a4a7a"}
            strokeWidth="2"
            onMouseEnter={() => setHoveredPart("iris")}
            onMouseLeave={() => setHoveredPart(null)}
            style={{ cursor: "pointer", transition: "fill 0.3s" }}
          />

          {/* Iris detail rings */}
          <circle cx="150" cy="155" r="35" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <circle cx="150" cy="155" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Pupil */}
          <circle cx="150" cy="155" r="18"
            fill={condition === "cataract" ? "#d1d5db" : "#0a0a0a"}
            style={{ transition: "fill 0.5s" }}
          />

          {/* Lens — inside pupil area */}
          <ellipse cx="150" cy="158" rx="12" ry="16"
            fill={getPartColor("lens") || "rgba(200,220,255,0.6)"}
            stroke={getPartColor("lens") ? "#c9933a" : "rgba(150,180,220,0.8)"}
            strokeWidth="1.5"
            onMouseEnter={() => setHoveredPart("lens")}
            onMouseLeave={() => setHoveredPart(null)}
            style={{ cursor: "pointer", transition: "all 0.3s" }}
          />

          {/* Retina — back curved layer */}
          <path
            d="M 42 155 Q 30 230 150 245 Q 270 230 258 155"
            fill={getPartColor("retina") || "#f4a460"}
            stroke={getPartColor("retina") ? "#c9933a" : "#cd853f"}
            strokeWidth="2"
            onMouseEnter={() => setHoveredPart("retina")}
            onMouseLeave={() => setHoveredPart(null)}
            style={{ cursor: "pointer", transition: "fill 0.3s" }}
          />

          {/* Optic nerve */}
          <ellipse cx="230" cy="200" rx="18" ry="12"
            fill={getPartColor("optic-nerve") || "#c9933a"}
            stroke={getPartColor("optic-nerve") ? "#c9933a" : "#a07830"}
            strokeWidth="2"
            onMouseEnter={() => setHoveredPart("optic-nerve")}
            onMouseLeave={() => setHoveredPart(null)}
            style={{ cursor: "pointer", transition: "fill 0.3s" }}
          />
          <rect x="245" y="195" width="30" height="10" rx="5"
            fill={getPartColor("optic-nerve") || "#c9933a"}
          />

          {/* Light ray animation for myopia/hyperopia */}
          {condition === "myopia" && (
            <g opacity="0.6">
              <line x1="30" y1="135" x2="148" y2="148" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4,3" />
              <circle cx="148" cy="148" r="3" fill="#2563eb" />
              <text x="35" y="125" fontSize="9" fill="#2563eb">Light focuses in front</text>
            </g>
          )}
          {condition === "hyperopia" && (
            <g opacity="0.6">
              <line x1="30" y1="145" x2="280" y2="210" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="4,3" />
              <circle cx="270" cy="207" r="3" fill="#16a34a" />
              <text x="35" y="135" fontSize="9" fill="#16a34a">Light focuses behind</text>
            </g>
          )}

          {/* Condition overlay effect */}
          {condition === "conjunctivitis" && (
            <ellipse cx="150" cy="155" rx="120" ry="100"
              fill="rgba(220,38,38,0.08)"
              stroke="rgba(220,38,38,0.3)"
              strokeWidth="3"
            />
          )}
          {condition === "cataract" && (
            <ellipse cx="150" cy="158" rx="12" ry="16"
              fill="rgba(200,200,200,0.7)"
            />
          )}

          {/* Hover tooltip */}
          {hoveredPart && (() => {
            const part = parts.find(p => p.id === hoveredPart)
            if (!part) return null
            return (
              <g>
                <rect x="10" y="260" width="280" height="32" rx="6" fill="rgba(26,39,68,0.92)" />
                <text x="150" y="274" textAnchor="middle" fontSize="10" fontWeight="700" fill="#c9933a">
                  {part.label}
                </text>
                <text x="150" y="286" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.85)">
                  {part.desc.substring(0, 55)}{part.desc.length > 55 ? "…" : ""}
                </text>
              </g>
            )
          })()}
        </svg>

        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
          {rotating ? "🔄 Click to pause" : "⏸ Click to resume"} · Hover parts to explore
        </p>
      </div>
    </div>
  )
}
