"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { Category } from "@/types/product";
import { useFilterStore } from "@/store/filterStore";
import ProductCard from "@/components/products/ProductCard";
import ProductFilter from "@/components/products/ProductFilter";
import { Search, PackageX, SlidersHorizontal, X } from "lucide-react";

interface ProductsPageClientProps {
  products: Product[];
}

export default function ProductsPageClient({ products }: ProductsPageClientProps) {
  const { category, minRating, searchQuery, setSearchQuery } = useFilterStore();
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategory, setSubcategory] = useState("All");
  const [formFilter, setFormFilter] = useState("All");
  const [rxOnly, setRxOnly] = useState(false);

  // Fetch public categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.ok ? r.json() : [])
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Listen for filter changes from ProductFilter component (via sessionStorage bridge)
  useEffect(() => {
    const handler = () => {
      setSubcategory(sessionStorage.getItem("filter_subcategory") || "All");
      setFormFilter(sessionStorage.getItem("filter_form") || "All");
      setRxOnly(sessionStorage.getItem("filter_rx") === "true");
    };
    window.addEventListener("filter-change", handler);
    return () => window.removeEventListener("filter-change", handler);
  }, []);

  const filtered = products.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (subcategory !== "All" && p.subcategory !== subcategory) return false;
    if (formFilter !== "All" && p.form !== formFilter) return false;
    if (rxOnly && !p.prescriptionRequired) return false;
    if (p.rating < minRating) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subcategory?.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile filter toggle */}
      <div className="md:hidden">
        <button onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 btn-primary btn-navy"
          style={{ fontSize: "13px", padding: "10px 20px" }}
          aria-label="Toggle filters">
          {showFilters ? <X size={15} /> : <SlidersHorizontal size={15} />}
          {showFilters ? "Hide Filters" : "Filters"}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`w-full lg:w-72 shrink-0 ${showFilters ? "block" : "hidden"} md:block`}>
        <div className="relative" style={{ marginBottom: "28px" }}>
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..." className="input-premium" style={{ paddingLeft: "44px" }} aria-label="Search products" />
        </div>
        <ProductFilter categories={categories} products={products} />
      </div>

      {/* Grid */}
      <div className="flex-1">
        <p className="text-[11px] font-semibold text-muted uppercase tracking-[0.1em] mb-6">
          Showing <span className="text-primary">{filtered.length}</span> of <span className="text-primary">{products.length}</span> products
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-5">
              <PackageX size={28} className="text-muted" />
            </div>
            <h3 className="font-display text-xl font-semibold text-primary mb-2">No products found</h3>
            <p className="text-muted text-sm max-w-sm">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
