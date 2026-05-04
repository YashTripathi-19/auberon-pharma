"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Category } from "@/types/product";
import { useToastStore } from "@/store/toastStore";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

const ICON_OPTIONS = ["eye", "shield", "pill", "heart", "activity", "flask", "stethoscope", "cross"];

const emptyForm = {
  name: "", description: "", icon: "eye",
  subcategories: "", isActive: true, isPublic: false,
};

export default function AdminCategoriesPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => { setForm({ ...emptyForm }); setEditId(null); setShowForm(true); };
  const openEdit = (c: Category) => {
    setForm({ name: c.name, description: c.description, icon: c.icon, subcategories: c.subcategories.join(", "), isActive: c.isActive, isPublic: c.isPublic });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim()) { addToast("error", "Name and description are required"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        icon: form.icon,
        subcategories: form.subcategories.split(",").map((s) => s.trim()).filter(Boolean),
        isActive: form.isActive,
        isPublic: form.isPublic,
      };
      const url = editId ? `/api/admin/categories/${editId}` : "/api/admin/categories";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      addToast("success", editId ? "Category updated" : "Category created");
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c: Category, field: "isPublic" | "isActive") => {
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: !c[field] }) });
    if (res.ok) {
      setCategories((prev) => prev.map((x) => x.id === c.id ? { ...x, [field]: !c[field] } : x));
      addToast("success", `${c.name} ${field === "isPublic" ? (c.isPublic ? "hidden from public" : "now public") : (c.isActive ? "deactivated" : "activated")}`);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { addToast("error", data.message || "Failed to delete"); return; }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
    addToast("success", "Category deleted");
  };

  const lbl: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.1 }}>Categories</h1>
          <p style={{ fontSize: "14px", color: "#6E6E73", marginTop: "6px" }}>Manage product categories and their public visibility</p>
        </div>
        <button onClick={openCreate} className="btn-primary btn-gold" style={{ fontSize: "13px", padding: "12px 24px", flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <Plus size={15} /> Add Category
        </button>
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "32px" }}>
          <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "24px" }}>{editId ? "Edit Category" : "Create Category"}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={lbl}>Name *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-premium" placeholder="e.g. Ophthalmics" />
            </div>
            <div>
              <label style={lbl}>Icon</label>
              <select value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="input-premium">
                {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={lbl}>Description *</label>
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-premium" placeholder="Brief description of this category" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={lbl}>Subcategories (comma separated)</label>
              <input value={form.subcategories} onChange={(e) => setForm((f) => ({ ...f, subcategories: e.target.value }))} className="input-premium" placeholder="Antibiotic Eye Drops, Lubricating Eye Drops, ..." />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button type="button" onClick={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))}
                style={{ background: "none", border: "none", cursor: "pointer", color: form.isPublic ? "#c9933a" : "#9CA3AF" }}>
                {form.isPublic ? <Eye size={22} style={{ color: "#c9933a" }} /> : <EyeOff size={22} style={{ color: "#9CA3AF" }} />}
              </button>
              <span style={{ fontSize: "13px", color: form.isPublic ? "#c9933a" : "#9CA3AF", fontWeight: 500 }}>{form.isPublic ? "Visible on public site" : "Hidden from public"}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
            <button onClick={handleSave} disabled={saving} className="btn-primary btn-gold" style={{ fontSize: "13px", padding: "11px 28px", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : editId ? "Update Category" : "Create Category"}
            </button>
            <button onClick={() => setShowForm(false)} style={{ fontSize: "13px", padding: "11px 20px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.12)", background: "transparent", cursor: "pointer", color: "#6E6E73", fontWeight: 500 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories table */}
      <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Categories table">
            <thead>
              <tr style={{ background: "#F5F5F7", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                {["Name", "Description", "Subcategories", "Public", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "48px", color: "#6E6E73" }}>Loading…</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "48px", fontSize: "14px", color: "#6E6E73" }}>No categories yet</td></tr>
              ) : categories.map((cat, i) => (
                <React.Fragment key={cat.id}>
                  <tr style={{ borderBottom: deleteConfirm === cat.id ? "none" : i < categories.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }} className="hover:bg-[#F5F5F7] transition-colors">
                    <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 600, color: "#0B1F3A" }}>{cat.name}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6E6E73", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.description}</td>
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "#6E6E73" }}>{cat.subcategories?.length || 0} subcategories</td>
                    <td style={{ padding: "14px 16px" }}>
                      <button onClick={() => handleToggle(cat, "isPublic")} style={{ background: "none", border: "none", cursor: "pointer", color: cat.isPublic ? "#c9933a" : "#9CA3AF" }} title={cat.isPublic ? "Visible on site — click to hide" : "Hidden from public — click to show"}>
                        {cat.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button onClick={() => openEdit(cat)} style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }} className="hover:bg-black/[0.06]" aria-label="Edit">
                          <Pencil size={13} style={{ color: "#6E6E73" }} />
                        </button>
                        <button onClick={() => setDeleteConfirm(deleteConfirm === cat.id ? null : cat.id)} style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }} className="hover:bg-red-50" aria-label="Delete">
                          <Trash2 size={13} style={{ color: "#dc2626" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {deleteConfirm === cat.id && (
                    <tr style={{ background: "#fef2f2", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                      <td colSpan={5} style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "13px", color: "#374151" }}>Delete <strong>{cat.name}</strong>? This cannot be undone.</span>
                          <button onClick={() => handleDelete(cat.id)} style={{ fontSize: "12px", fontWeight: 600, color: "white", background: "#dc2626", border: "none", borderRadius: "999px", padding: "5px 14px", cursor: "pointer" }}>Confirm Delete</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: "12px", color: "#6E6E73", background: "none", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "999px", padding: "5px 14px", cursor: "pointer" }}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
