"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Product, Category } from "@/types/product";
import { useToastStore } from "@/store/toastStore";
import { Loader2 } from "lucide-react";

interface ProductFormProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

type FormState = Omit<Product, "id">;

const empty: FormState = {
  name: "", slug: "", category: "Ophthalmics",
  subcategory: null, manufacturer: "Chandra Pharma",
  prescriptionRequired: false, form: null,
  description: "", dosageInfo: "", usage: "",
  composition: "", sideEffects: "",
  price: 0, stock: 0, rating: 4.5, reviewCount: 0,
  isActive: true, images: [] as string[], tags: [] as string[],
};

const FORM_TYPES = ["Eye Drops", "Cream", "Tablets", "Capsules", "Ointment", "Gel", "Syrup", "Injection", "Other"];

export default function ProductForm({ product, isOpen, onClose, onSave }: ProductFormProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({ ...empty });
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagsInput, setTagsInput] = useState(""); // separate string state for tags

  // Load all categories (admin route) — reload whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/admin/categories")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setCategories(data);
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      const { id: _id, ...rest } = product;
      void _id;
      setForm({ ...empty, ...rest });
      setTagsInput(rest.tags?.join(", ") || "");
    } else {
      setForm({ ...empty });
      setTagsInput("");
    }
  }, [product, isOpen]);

  const set = (field: keyof FormState, value: string | number | boolean | string[] | null) =>
    setForm((f) => ({ ...f, [field]: value }));

  // When category changes, reset subcategory
  const handleCategoryChange = (cat: string) => {
    set("category", cat);
    set("subcategory", null);
  };

  const selectedCategory = categories.find((c) => c.name === form.category);
  const subcategories = selectedCategory?.subcategories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { addToast("error", "Product name is required"); return; }
    setSaving(true);
    try {
      const slug = form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const payload: FormState = { ...form, slug };
      const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      addToast("success", product ? "Product updated" : "Product created");
      onSave();
      onClose();
    } catch {
      addToast("error", "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const L: React.CSSProperties = {
    display: "block", fontSize: "11px", fontWeight: 600,
    color: "#6E6E73", textTransform: "uppercase",
    letterSpacing: "0.1em", marginBottom: "10px",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? "Edit Product" : "Add Product"} size="xl">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* Name */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={L}>Product Name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className="input-premium" placeholder="e.g. Moxifloxacin Eye Drops 0.5%" required />
          </div>

          {/* Category — full width so it's clearly visible */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={L}>Category *</label>
            <select value={form.category} onChange={(e) => handleCategoryChange(e.target.value)} className="input-premium" required>
              {categories.length > 0
                ? categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)
                : (
                  <>
                    <option value="Ophthalmics">Ophthalmics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                  </>
                )}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label style={L}>Subcategory</label>
            <select value={form.subcategory || ""} onChange={(e) => set("subcategory", e.target.value || null)} className="input-premium">
              <option value="">— Select subcategory (optional) —</option>
              {subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Manufacturer */}
          <div>
            <label style={L}>Manufacturer</label>
            <input value={form.manufacturer || ""} onChange={(e) => set("manufacturer", e.target.value || null)} className="input-premium" placeholder="Chandra Pharma" />
          </div>

          {/* Form (dosage form) */}
          <div>
            <label style={L}>Dosage Form</label>
            <select value={form.form || ""} onChange={(e) => set("form", e.target.value || null)} className="input-premium">
              <option value="">— Select —</option>
              {FORM_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Price + Stock */}
          <div>
            <label style={L}>Price (Rs.) *</label>
            <input type="number" min={0} value={form.price} onChange={(e) => set("price", Number(e.target.value))} className="input-premium" placeholder="185" required />
          </div>
          <div>
            <label style={L}>Stock *</label>
            <input type="number" min={0} value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} className="input-premium" placeholder="100" required />
          </div>

          {/* Description */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={L}>Description *</label>
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className="input-premium" placeholder="Brief product description..." required />
          </div>

          {/* Composition + Dosage */}
          <div>
            <label style={L}>Composition</label>
            <textarea rows={2} value={form.composition} onChange={(e) => set("composition", e.target.value)} className="input-premium" placeholder="Active ingredients..." />
          </div>
          <div>
            <label style={L}>Dosage Info</label>
            <textarea rows={2} value={form.dosageInfo} onChange={(e) => set("dosageInfo", e.target.value)} className="input-premium" placeholder="Dosage instructions..." />
          </div>

          {/* Usage + Side Effects */}
          <div>
            <label style={L}>Usage</label>
            <textarea rows={2} value={form.usage} onChange={(e) => set("usage", e.target.value)} className="input-premium" placeholder="How to use..." />
          </div>
          <div>
            <label style={L}>Side Effects</label>
            <textarea rows={2} value={form.sideEffects} onChange={(e) => set("sideEffects", e.target.value)} className="input-premium" placeholder="Known side effects..." />
          </div>

          {/* Tags */}
          <div>
            <label style={L}>Tags (comma separated)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onBlur={(e) => {
                const parsed = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                set("tags", parsed);
              }}
              className="input-premium"
              placeholder="antibiotic, eye drops, prescription required"
            />
            <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>Separate tags with commas. Spaces within tags are allowed.</p>
          </div>

          {/* Prescription Required + Active toggles */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button type="button" onClick={() => set("prescriptionRequired", !form.prescriptionRequired)}
                style={{ width: "44px", height: "24px", borderRadius: "999px", background: form.prescriptionRequired ? "#c9933a" : "#d1d5db", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}
                aria-label="Toggle prescription required">
                <span style={{ position: "absolute", top: "3px", left: form.prescriptionRequired ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </button>
              <span style={{ fontSize: "12px", color: form.prescriptionRequired ? "#c9933a" : "#6E6E73", fontWeight: 500 }}>
                {form.prescriptionRequired ? "Prescription Required" : "OTC (No Prescription)"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button type="button" onClick={() => set("isActive", !form.isActive)}
                style={{ width: "44px", height: "24px", borderRadius: "999px", background: form.isActive ? "#10b981" : "#d1d5db", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}
                aria-label="Toggle active">
                <span style={{ position: "absolute", top: "3px", left: form.isActive ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </button>
              <span style={{ fontSize: "12px", color: form.isActive ? "#10b981" : "#6E6E73", fontWeight: 500 }}>
                {form.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "24px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button type="button" onClick={onClose}
            style={{ padding: "11px 24px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.1)", background: "transparent", fontSize: "13px", fontWeight: 500, color: "#6E6E73", cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary btn-gold" style={{ padding: "11px 28px", fontSize: "13px", opacity: saving ? 0.6 : 1 }}>
            {saving
              ? <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><Loader2 size={14} className="animate-spin" /> Saving...</span>
              : product ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
