"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useToastStore } from "@/store/toastStore"
import { Pencil, Trash2, ExternalLink } from "lucide-react"

interface AffiliatedHospital {
  id: string
  name: string
  city: string
  speciality: string
  phone: string
  website: string
  logo: string
  active: boolean
  createdAt: string
}

const EMPTY_FORM = {
  name: "",
  city: "",
  speciality: "",
  phone: "",
  website: "",
  logo: "",
  active: true
}

function SkeletonRow() {
  return (
    <tr>
      {[48, 160, 100, 120, 120, 140, 80, 80].map((w, i) => (
        <td key={i} style={{ padding: "18px 20px" }}>
          <div className="animate-pulse bg-gray-100 rounded" style={{ height: "14px", width: `${w}px` }} />
        </td>
      ))}
    </tr>
  )
}

export default function AffiliatedHospitalsPage() {
  const addToast = useToastStore(s => s.addToast)
  const [hospitals, setHospitals] = useState<AffiliatedHospital[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHospital, setEditingHospital] = useState<AffiliatedHospital | null>(null)
  const [formData, setFormData] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  const fetchHospitals = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/affiliated-hospitals")
      const data = await res.json()
      setHospitals(data)
    } catch {
      addToast("error", "Failed to load hospitals")
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { fetchHospitals() }, [fetchHospitals])

  const openAdd = () => {
    setEditingHospital(null)
    setFormData({ ...EMPTY_FORM })
    setShowForm(true)
  }

  const openEdit = (h: AffiliatedHospital) => {
    setEditingHospital(h)
    setFormData({
      name: h.name,
      city: h.city,
      speciality: h.speciality,
      phone: h.phone,
      website: h.website,
      logo: h.logo,
      active: h.active
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingHospital(null)
    setFormData({ ...EMPTY_FORM })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.city || !formData.speciality || !formData.phone) {
      addToast("error", "Name, city, speciality and phone are required")
      return
    }
    setSaving(true)
    try {
      const url = editingHospital
        ? `/api/admin/affiliated-hospitals/${editingHospital.id}`
        : "/api/admin/affiliated-hospitals"
      const method = editingHospital ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error()
      addToast("success", editingHospital ? "Hospital updated" : "Hospital added")
      closeForm()
      fetchHospitals()
    } catch {
      addToast("error", "Failed to save hospital")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (h: AffiliatedHospital) => {
    if (!window.confirm(`Delete "${h.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/affiliated-hospitals/${h.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      addToast("success", "Hospital deleted")
      fetchHospitals()
    } catch {
      addToast("error", "Failed to delete hospital")
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.1 }}>
            Affiliated Hospitals
          </h1>
          <p style={{ fontSize: "14px", color: "#6E6E73", marginTop: "6px" }}>
            Manage hospitals displayed on the public hospital page
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{ padding: "10px 22px", background: "#C9963E", color: "white", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          + Add Hospital
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.08)", padding: "32px" }}>
          <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.4rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "24px" }}>
            {editingHospital ? "Edit Hospital" : "Add New Hospital"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              {[
                { key: "name", label: "Hospital Name *", placeholder: "e.g. Drishti Eye Hospital" },
                { key: "city", label: "City *", placeholder: "e.g. Kanpur" },
                { key: "speciality", label: "Speciality *", placeholder: "e.g. Ophthalmology" },
                { key: "phone", label: "Phone *", placeholder: "+91 9999999999" },
                { key: "website", label: "Website", placeholder: "https://example.com" },
                { key: "logo", label: "Logo URL", placeholder: "https://..." }
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={formData[field.key as keyof typeof formData] as string}
                    onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "13px", color: "#0B1F3A", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
            </div>

            {/* Active toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "#0B1F3A" }}>Active</label>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                style={{
                  width: "44px", height: "24px", borderRadius: "999px", border: "none", cursor: "pointer",
                  background: formData.active ? "#C9963E" : "#d1d5db",
                  position: "relative", transition: "background 0.2s"
                }}
              >
                <span style={{
                  position: "absolute", top: "3px",
                  left: formData.active ? "23px" : "3px",
                  width: "18px", height: "18px", borderRadius: "50%",
                  background: "white", transition: "left 0.2s"
                }} />
              </button>
              <span style={{ fontSize: "12px", color: "#6E6E73" }}>
                {formData.active ? "Visible on public site" : "Hidden from public site"}
              </span>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{ padding: "10px 28px", background: saving ? "#d1d5db" : "#0B1F3A", color: "white", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}
              >
                {saving ? "Saving..." : editingHospital ? "Save Changes" : "Add Hospital"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                style={{ padding: "10px 24px", background: "transparent", color: "#6E6E73", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "999px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table card */}
      <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Affiliated hospitals table">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#F5F5F7" }}>
                {["Logo", "Name", "City", "Speciality", "Phone", "Website", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "16px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>{[1, 2, 3].map(i => <SkeletonRow key={i} />)}</>
              ) : hospitals.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "64px 20px", fontSize: "14px", color: "#6E6E73" }}>
                    No affiliated hospitals yet — add one above
                  </td>
                </tr>
              ) : (
                hospitals.map(h => (
                  <tr key={h.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }} className="hover:bg-[#F5F5F7] transition-colors">
                    {/* Logo */}
                    <td style={{ padding: "16px 20px" }}>
                      {h.logo ? (
                        <img src={h.logo} alt={h.name} style={{ width: 40, height: 40, borderRadius: "8px", objectFit: "cover", border: "1px solid rgba(0,0,0,0.08)" }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: "8px", background: "#F5F5F7", border: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                          🏥
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "13px", fontWeight: 600, color: "#0B1F3A", whiteSpace: "nowrap" }}>{h.name}</td>
                    <td style={{ padding: "16px 20px", fontSize: "13px", color: "#6E6E73" }}>{h.city}</td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px", background: "#F0F4FF", color: "#1a2744" }}>
                        {h.speciality}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "13px", color: "#6E6E73", whiteSpace: "nowrap" }}>{h.phone}</td>
                    <td style={{ padding: "16px 20px" }}>
                      {h.website ? (
                        <a href={h.website} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: "12px", color: "#C9963E", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
                          Visit <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#d1d5db" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{
                        fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px",
                        background: h.active ? "#f0fdf4" : "#fef2f2",
                        color: h.active ? "#16a34a" : "#dc2626"
                      }}>
                        {h.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => openEdit(h)}
                          style={{ background: "none", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", color: "#0B1F3A", display: "flex", alignItems: "center" }}
                          className="hover:bg-[#F5F5F7] transition-colors"
                          aria-label={`Edit ${h.name}`}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(h)}
                          style={{ background: "none", border: "none", padding: "6px 4px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center" }}
                          className="hover:opacity-70 transition-opacity"
                          aria-label={`Delete ${h.name}`}
                        >
                          <Trash2 size={13} />
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
    </div>
  )
}
