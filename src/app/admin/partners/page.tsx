"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  category: string;
  description: string;
  website: string;
  logo: string;
  active: boolean;
  createdAt: string;
}

const CATEGORIES = ["Hospital", "Pharma", "NGO", "Clinic", "Research", "Other"] as const;

const categoryColors: Record<string, string> = {
  Hospital: "bg-blue-50 text-blue-600",
  Pharma: "bg-emerald-50 text-emerald-600",
  NGO: "bg-orange-50 text-orange-600",
  Clinic: "bg-purple-50 text-purple-600",
  Research: "bg-[#0B1F3A] text-white",
  Other: "bg-gray-100 text-gray-600",
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Hospital",
    description: "",
    website: "",
    logo: "",
    active: true,
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/admin/partners");
      if (res.ok) {
        const data = await res.json();
        setPartners(data);
      }
    } catch (err) {
      console.error("Failed to fetch partners:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category) {
      setMessage({ type: "error", text: "Name and category are required" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const url = editingPartner
        ? `/api/admin/partners/${editingPartner.id}`
        : "/api/admin/partners";
      const method = editingPartner ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save partner");
      }

      setMessage({
        type: "success",
        text: editingPartner ? "Partner updated successfully" : "Partner added successfully",
      });
      
      resetForm();
      await fetchPartners();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save partner",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      category: partner.category,
      description: partner.description,
      website: partner.website,
      logo: partner.logo,
      active: partner.active,
    });
    setShowForm(true);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete partner");
      }
      setMessage({ type: "success", text: "Partner deleted successfully" });
      setDeleteConfirm(null);
      await fetchPartners();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete partner",
      });
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Hospital",
      description: "",
      website: "",
      logo: "",
      active: true,
    });
    setEditingPartner(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <div style={{ color: "#6E6E73", fontSize: "15px" }}>Loading partners...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.1 }}>
            Partners & Sponsors
          </h1>
          <p style={{ fontSize: "14px", color: "#6E6E73", marginTop: "6px" }}>
            Manage partner organizations and sponsors
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
            setMessage(null);
          }}
          style={{
            padding: "10px 24px",
            background: "#c9933a",
            color: "white",
            border: "none",
            borderRadius: "999px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancel" : "Add Partner"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
            color: message.type === "success" ? "#16a34a" : "#dc2626",
            border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#0B1F3A", marginBottom: "20px" }}>
            {editingPartner ? "Edit Partner" : "Add New Partner"}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#0B1F3A", marginBottom: "6px" }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Organization name"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#0B1F3A", marginBottom: "6px" }}>
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#0B1F3A", marginBottom: "6px" }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the partner"
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#0B1F3A", marginBottom: "6px" }}>
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#0B1F3A", marginBottom: "6px" }}>
                  Logo URL
                </label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#0B1F3A", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                Active
              </label>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "10px 24px",
                  background: "#c9933a",
                  color: "white",
                  border: "none",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : editingPartner ? "Update Partner" : "Add Partner"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "10px 24px",
                  background: "transparent",
                  color: "#6E6E73",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {partners.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#6E6E73", fontSize: "15px" }}>
          No partners added yet
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F5F5F7", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Logo
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Name
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Category
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Website
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Status
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "center", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner, i) => (
                  <tr key={partner.id} style={{ borderBottom: i < partners.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }} className="hover:bg-[#F5F5F7] transition-colors">
                    <td style={{ padding: "16px 20px" }}>
                      {partner.logo ? (
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "#F5F5F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "#6E6E73" }}>
                          {partner.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "13px", color: "#0B1F3A", fontWeight: 500 }}>
                      {partner.name}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-full ${categoryColors[partner.category] || categoryColors.Other}`}>
                        {partner.category}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "13px", color: "#6E6E73" }}>
                      {partner.website ? (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#c9933a", textDecoration: "none", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        >
                          {partner.website.replace(/^https?:\/\//, "")}
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "4px 12px",
                        borderRadius: "999px",
                        background: partner.active ? "#f0fdf4" : "#F5F5F7",
                        color: partner.active ? "#16a34a" : "#6E6E73",
                      }}>
                        {partner.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {deleteConfirm === partner.id ? (
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            onClick={() => handleDelete(partner.id)}
                            disabled={deleting === partner.id}
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "white",
                              background: "#dc2626",
                              border: "none",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              cursor: "pointer",
                              opacity: deleting === partner.id ? 0.6 : 1,
                            }}
                          >
                            {deleting === partner.id ? "..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              color: "#6E6E73",
                              background: "none",
                              border: "1px solid rgba(0,0,0,0.12)",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            onClick={() => handleEdit(partner)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "32px",
                              height: "32px",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#c9933a",
                              borderRadius: "6px",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#fff9f0";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "none";
                            }}
                            aria-label="Edit partner"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(partner.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "32px",
                              height: "32px",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#dc2626",
                              borderRadius: "6px",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#fef2f2";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "none";
                            }}
                            aria-label="Delete partner"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
