"use client"

import { useEffect, useState } from "react"
import { Building2, MapPin, Phone, ExternalLink } from "lucide-react"

interface AffiliatedHospital {
  id: string
  name: string
  city: string
  speciality: string
  phone: string
  website: string
  logo: string
  active: boolean
}

export default function AffiliatedHospitalsSection() {
  const [hospitals, setHospitals] = useState<AffiliatedHospital[]>([])

  useEffect(() => {
    fetch("/api/affiliated-hospitals")
      .then(r => r.ok ? r.json() : [])
      .then(setHospitals)
      .catch(() => {})
  }, [])

  if (hospitals.length === 0) return null

  return (
    <section style={{ background: "#f8f7f4", padding: "80px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>
        {/* Section heading */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ color: "#c9933a", fontWeight: 700, letterSpacing: "0.15em", fontSize: 12, textTransform: "uppercase", marginBottom: 12 }}>
            TRUSTED PARTNERS
          </p>
          <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: "#1a2744", marginBottom: 12, lineHeight: 1.2 }}>
            Our Affiliated Hospitals
          </h2>
          <p style={{ color: "#6E6E73", fontSize: 15, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            Trusted partners in eye care across India
          </p>
        </div>

        {/* Cards grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 24
        }}>
          {hospitals.map(h => (
            <HospitalCard key={h.id} h={h} />
          ))}
        </div>
      </div>
    </section>
  )
}

function HospitalCard({ h }: { h: AffiliatedHospital }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        borderRadius: 16,
        padding: 28,
        border: `1px solid ${hovered ? "#1a2744" : "#e5e7eb"}`,
        boxShadow: hovered ? "0 4px 24px rgba(26,39,68,0.12)" : "0 2px 12px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        transition: "border-color 0.2s, box-shadow 0.2s"
      }}
    >
      {/* Logo + Name */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {h.logo ? (
          <img
            src={h.logo}
            alt={h.name}
            style={{ width: 48, height: 48, borderRadius: 10, objectFit: "contain", border: "1px solid #e5e7eb", flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 10, background: "#f0f4ff", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Building2 size={22} color="#1a2744" strokeWidth={1.5} />
          </div>
        )}
        <h3 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#1a2744", lineHeight: 1.3, margin: 0 }}>
          {h.name}
        </h3>
      </div>

      {/* City */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <MapPin size={13} color="#c9933a" strokeWidth={2} />
        <span style={{ fontSize: 13, color: "#c9933a", fontWeight: 600 }}>{h.city}</span>
      </div>

      {/* Speciality */}
      <p style={{ fontSize: 13, color: "#6E6E73", margin: 0, lineHeight: 1.5 }}>{h.speciality}</p>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #f3f4f6" }} />

      {/* Phone */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Phone size={13} color="#6E6E73" strokeWidth={1.5} />
        <span style={{ fontSize: 13, color: "#374151" }}>{h.phone}</span>
      </div>

      {/* Website */}
      {h.website && (
        <a
          href={h.website}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#c9933a", fontWeight: 600, textDecoration: "none" }}
        >
          <ExternalLink size={13} strokeWidth={2} />
          Visit Website
        </a>
      )}
    </div>
  )
}
