"use client";
import React, { useState, useEffect } from "react";
import { useFilterStore } from "@/store/filterStore";
import { cn } from "@/lib/utils";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Product } from "@/types/product";

const ratings = [
  { label: "4★ & above", value: 4 },
  { label: "3★ & above", value: 3 },
  { label: "All ratings", value: 0 },
];

interface FilterContentProps {
  onClose?: () => void;
  categories: Category[];
  products: Product[];
}

function FilterContent({ onClose, categories, products }: FilterContentProps) {
  const { category, minRating, setCategory, setMinRating, resetFilters } = useFilterStore();
  const [subcategory, setSubcategory] = useState("All");
  const [formFilter, setFormFilter] = useState("All");
  const [rxOnly, setRxOnly] = useState(false);

  const hasFilters = category !== "All" || minRating > 0 || subcategory !== "All" || formFilter !== "All" || rxOnly;

  const selectedCat = categories.find((c) => c.name === category);
  const subcategories = selectedCat?.subcategories || [];

  // Reset subcategory when category changes
  useEffect(() => { setSubcategory("All"); }, [category]);

  // Derive available forms from visible products
  const visibleForms = Array.from(new Set(
    products
      .filter((p) => category === "All" || p.category === category)
      .map((p) => p.form)
      .filter(Boolean)
  )) as string[];

  const handleReset = () => {
    resetFilters();
    setSubcategory("All");
    setFormFilter("All");
    setRxOnly(false);
  };

  // Expose subcategory/form/rx to parent via store — we extend filtering in ProductsPageClient
  // Store them in sessionStorage as a simple bridge (avoids store changes)
  useEffect(() => {
    sessionStorage.setItem("filter_subcategory", subcategory);
    sessionStorage.setItem("filter_form", formFilter);
    sessionStorage.setItem("filter_rx", String(rxOnly));
    window.dispatchEvent(new Event("filter-change"));
  }, [subcategory, formFilter, rxOnly]);

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", fontSize: "0.8125rem", borderRadius: "999px", fontWeight: 500,
    cursor: "pointer", border: "none", transition: "all 0.2s",
    background: active ? "#0B1F3A" : "#F5F5F7",
    color: active ? "white" : "#6E6E73",
  });

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
        <p className="font-display font-semibold text-primary" style={{ fontSize: "1.05rem" }}>Filters</p>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button onClick={handleReset} className="flex items-center gap-1 text-[12px] text-accent font-medium" aria-label="Reset filters">
              <RotateCcw size={11} /> Reset
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1 text-muted hover:text-primary" aria-label="Close filters">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div style={{ marginBottom: "20px" }}>
        <p className="text-muted font-semibold uppercase" style={{ fontSize: "10px", letterSpacing: "0.12em", marginBottom: "12px" }}>Category</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategory("All")} style={pillStyle(category === "All")} aria-label="All categories">All</button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setCategory(cat.name)} style={pillStyle(category === cat.name)} aria-label={`Filter by ${cat.name}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory — only when a specific category is selected */}
      {category !== "All" && subcategories.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <p className="text-muted font-semibold uppercase" style={{ fontSize: "10px", letterSpacing: "0.12em", marginBottom: "12px" }}>Subcategory</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSubcategory("All")} style={pillStyle(subcategory === "All")} aria-label={`All ${category}`}>All {category}</button>
            {subcategories.map((sub) => (
              <button key={sub} onClick={() => setSubcategory(sub)} style={pillStyle(subcategory === sub)} aria-label={`Filter by ${sub}`}>
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div style={{ marginBottom: "20px" }}>
        <p className="text-muted font-semibold uppercase" style={{ fontSize: "10px", letterSpacing: "0.12em", marginBottom: "12px" }}>Rating</p>
        <div className="space-y-0">
          {ratings.map((r) => (
            <button key={r.value} onClick={() => setMinRating(r.value)}
              className={cn("block w-full text-left rounded-xl text-[13px] transition-all", minRating === r.value ? "bg-primary/5 text-primary font-medium" : "text-muted hover:bg-[#F5F5F7] hover:text-primary")}
              style={{ padding: "10px 12px" }} aria-label={`Filter by ${r.label}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form filter */}
      {visibleForms.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <p className="text-muted font-semibold uppercase" style={{ fontSize: "10px", letterSpacing: "0.12em", marginBottom: "12px" }}>Form</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFormFilter("All")} style={{ ...pillStyle(formFilter === "All"), padding: "6px 12px", fontSize: "0.75rem" }}>All</button>
            {visibleForms.map((f) => (
              <button key={f} onClick={() => setFormFilter(f)} style={{ ...pillStyle(formFilter === f), padding: "6px 12px", fontSize: "0.75rem" }} aria-label={`Filter by ${f}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prescription filter */}
      <div>
        <p className="text-muted font-semibold uppercase" style={{ fontSize: "10px", letterSpacing: "0.12em", marginBottom: "12px" }}>Prescription</p>
        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: "#374151" }}>
          <input type="checkbox" checked={rxOnly} onChange={(e) => setRxOnly(e.target.checked)} style={{ accentColor: "#0B1F3A", width: "15px", height: "15px" }} />
          Rx required only
        </label>
      </div>
    </div>
  );
}

interface ProductFilterProps {
  categories: Category[];
  products: Product[];
}

export default function ProductFilter({ categories, products }: ProductFilterProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { category, minRating } = useFilterStore();
  const hasFilters = category !== "All" || minRating > 0;

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl border border-black/[0.06]" style={{ padding: "24px" }}>
        <FilterContent categories={categories} products={products} />
      </div>

      {/* Mobile toggle */}
      <button
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-full border border-black/[0.08] bg-white text-[13px] font-medium text-primary mb-4"
        onClick={() => setMobileOpen(true)}
        aria-label="Open filters"
      >
        <SlidersHorizontal size={14} />
        Filters
        {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="w-8 h-1 bg-black/10 rounded-full mx-auto mb-6" />
              <FilterContent onClose={() => setMobileOpen(false)} categories={categories} products={products} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
