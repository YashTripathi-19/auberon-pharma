"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Product } from "@/types/product";
import { RestockNotification } from "@/types/restock";
import { useToastStore } from "@/store/toastStore";
import ProductForm from "@/components/admin/ProductForm";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Bell, Eye, EyeOff } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [restockNotifs, setRestockNotifs] = useState<RestockNotification[]>([]);
  const [restockOpen, setRestockOpen] = useState(false);
  const [restockExpanded, setRestockExpanded] = useState<string | null>(null);
  const [adminCategories, setAdminCategories] = useState<{ id: string; name: string; isPublic: boolean }[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data);
  }, []);

  const fetchRestockNotifs = useCallback(async () => {
    const res = await fetch("/api/admin/restock");
    if (res.ok) setRestockNotifs(await res.json());
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchRestockNotifs();
    fetch("/api/admin/categories").then((r) => r.ok ? r.json() : []).then(setAdminCategories).catch(() => {});
  }, [fetchProducts, fetchRestockNotifs]);

  const handleToggleCategoryPublic = async (cat: { id: string; name: string; isPublic: boolean }) => {
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublic: !cat.isPublic }) });
    if (res.ok) {
      setAdminCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, isPublic: !c.isPublic } : c));
      addToast("success", `${cat.name} is now ${!cat.isPublic ? "public" : "hidden"}`);
    }
  };

  const handleManualNotify = async (productId: string) => {
    setNotifying(true);
    try {
      const res = await fetch("/api/admin/restock/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addToast("success", `Notified ${data.notifiedCount} customer${data.notifiedCount !== 1 ? "s" : ""}`);
        // Refetch to update UI
        fetchRestockNotifs();
      } else if (res.status === 400 && data.error === "Insufficient stock") {
        addToast("error", `Cannot notify — stock (${data.currentStock} units) is less than requested (${data.totalRequested} units). Add stock first.`);
      } else {
        addToast("error", data.message || "Failed to send notifications");
      }
    } catch (err) {
      console.error("Failed to notify customers:", err);
      addToast("error", "Something went wrong");
    } finally {
      setNotifying(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (!res.ok) throw new Error();
      addToast("success", `${product.name} ${product.isActive ? "deactivated" : "activated"}`);
      fetchProducts();
    } catch {
      addToast("error", "Failed to update product status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      addToast("success", `${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      addToast("error", "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const categories = ["All", "Ophthalmics"];

  const filtered = products.filter((p) => {
    if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.1 }}>Products</h1>
          <p style={{ fontSize: "14px", color: "#6E6E73", marginTop: "6px" }}>Manage your product catalogue</p>
        </div>
        <button
          onClick={() => { setEditProduct(null); setShowForm(true); }}
          className="btn-primary btn-gold"
          style={{ fontSize: "13px", padding: "12px 24px", flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}
          aria-label="Add new product"
        >
          <Plus size={15} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#6E6E73", pointerEvents: "none" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-premium"
            style={{ paddingLeft: "44px" }}
            aria-label="Search products"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-premium"
          style={{ maxWidth: "200px" }}
          aria-label="Filter by category"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Products table">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#F5F5F7" }}>
                {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h, i) => (
                  <th key={h} style={{
                    padding: "16px 20px",
                    fontSize: "10px", fontWeight: 600, color: "#6E6E73",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    textAlign: i >= 2 ? "center" : "left",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.6) }}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}
                    className="hover:bg-[#F5F5F7] transition-colors"
                  >
                    <td style={{ padding: "18px 20px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "#0B1F3A" }}>{product.name}</p>
                    </td>
                    <td style={{ padding: "18px 20px" }}>
                      <Badge variant="accent">{product.category}</Badge>
                    </td>
                    <td style={{ padding: "18px 20px", textAlign: "center", fontSize: "13px", fontWeight: 500, color: "#0B1F3A" }}>
                      {formatCurrency(product.price)}
                    </td>
                    <td style={{ padding: "18px 20px", textAlign: "center", fontSize: "13px", fontWeight: 500, color: product.stock < 20 ? "#ef4444" : "#0B1F3A" }}>
                      {product.stock < 20 ? (
                        <motion.span
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                          {product.stock}
                        </motion.span>
                      ) : (
                        product.stock
                      )}
                    </td>
                    <td style={{ padding: "18px 20px", textAlign: "center" }}>
                      <button onClick={() => handleToggleActive(product)} aria-label={`Toggle ${product.name}`}>
                        {product.isActive
                          ? <ToggleRight size={28} className="text-emerald-500" />
                          : <ToggleLeft size={28} className="text-gray-400" />}
                      </button>
                    </td>
                    <td style={{ padding: "18px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <button
                          onClick={() => { setEditProduct(product); setShowForm(true); }}
                          style={{ width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }}
                          className="hover:bg-primary/5 transition-colors"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil size={14} style={{ color: "#6E6E73" }} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          style={{ width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }}
                          className="hover:bg-red-50 transition-colors"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 size={14} style={{ color: "#f87171" }} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {showForm && (
        <ProductForm
          product={editProduct}
          isOpen={showForm}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          onSave={fetchProducts}
        />
      )}

      {deleteTarget && (
        <Modal isOpen={true} onClose={() => setDeleteTarget(null)} title="Confirm Delete" size="sm">
          <p style={{ fontSize: "15px", color: "#6E6E73", lineHeight: 1.8, marginBottom: "32px" }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "#0B1F3A", fontWeight: 600 }}>{deleteTarget.name}</strong>?{" "}
            This action cannot be undone.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button onClick={() => setDeleteTarget(null)} style={{ padding: "12px 24px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.1)", background: "transparent", fontSize: "14px", fontWeight: 500, color: "#6E6E73", cursor: "pointer" }}>Cancel</button>
            <button onClick={handleDelete} disabled={deleting} style={{ padding: "12px 28px", borderRadius: "999px", background: "#dc2626", color: "white", border: "none", fontSize: "14px", fontWeight: 500, cursor: "pointer", opacity: deleting ? 0.6 : 1 }}>
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}

      {/* Restock Notification Requests panel */}
      {restockNotifs.filter(r => !r.notifiedAt).length > 0 && (
        <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <button onClick={() => setRestockOpen((v) => !v)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", background: "none", border: "none", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Bell size={16} style={{ color: "#c9933a" }} />
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#0B1F3A" }}>Restock Notification Requests</span>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 10px", borderRadius: "999px", background: "#fef9ec", color: "#c9933a", border: "1px solid #f0d9a0" }}>
                {restockNotifs.filter(r => !r.notifiedAt).length} customer{restockNotifs.filter(r => !r.notifiedAt).length !== 1 ? "s" : ""} waiting
              </span>
            </div>
            {restockOpen ? <ChevronUp size={16} style={{ color: "#6E6E73" }} /> : <ChevronDown size={16} style={{ color: "#6E6E73" }} />}
          </button>

          {restockOpen && (
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", overflowX: "auto" }}>
              {(() => {
                // Filter to show only pending (not notified) entries
                const pendingNotifs = restockNotifs.filter(r => !r.notifiedAt);
                
                if (pendingNotifs.length === 0) {
                  return <p style={{ padding: "32px 24px", fontSize: "14px", color: "#6E6E73", textAlign: "center" }}>No pending restock requests</p>;
                }

                // Group by product
                const grouped = pendingNotifs.reduce((acc, n) => {
                  if (!acc[n.productId]) acc[n.productId] = { productName: n.productName, notifs: [] };
                  acc[n.productId].notifs.push(n);
                  return acc;
                }, {} as Record<string, { productName: string; notifs: RestockNotification[] }>);

              return (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F5F5F7", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      {["Product", "Customers Waiting", "Total Desired Qty", "Current Stock", "Stock Status", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(grouped).map(([productId, { productName, notifs }]) => {
                      const product = products.find((p) => p.id === productId);
                      const stock = product?.stock ?? 0;
                      const totalQty = notifs.reduce((s, n) => s + n.desiredQuantity, 0);
                      const isExpanded = restockExpanded === productId;
                      return (
                        <React.Fragment key={productId}>
                          <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }} className="hover:bg-[#F5F5F7] transition-colors">
                            <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 500, color: "#0B1F3A" }}>{productName}</td>
                            <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6E6E73" }}>
                              <button onClick={() => setRestockExpanded(isExpanded ? null : productId)}
                                style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#0B1F3A", fontWeight: 500 }}>
                                {notifs.length} {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>
                            </td>
                            <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6E6E73" }}>{totalQty} units</td>
                            <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 600, color: stock === 0 ? "#dc2626" : stock < 20 ? "#f97316" : "#16a34a" }}>{stock}</td>
                            <td style={{ padding: "14px 16px" }}>
                              {stock === 0
                                ? <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#fef2f2", color: "#dc2626" }}>Critical</span>
                                : stock < 20
                                ? <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#fff7ed", color: "#c2410c" }}>Low</span>
                                : <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#f0fdf4", color: "#16a34a" }}>Available</span>}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <button 
                                onClick={() => handleManualNotify(productId)} 
                                disabled={notifying}
                                className="btn-primary btn-gold" 
                                style={{ 
                                  fontSize: "11px", 
                                  padding: "5px 14px",
                                  opacity: notifying ? 0.6 : 1,
                                  cursor: notifying ? "not-allowed" : "pointer"
                                }}
                              >
                                {notifying ? "Sending..." : "Notify Now"}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr style={{ background: "#F9F9FB", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                              <td colSpan={6} style={{ padding: "12px 24px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  {notifs.map((n) => (
                                    <div key={n.id} style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#6E6E73", alignItems: "center" }}>
                                      <span style={{ fontWeight: 500, color: "#0B1F3A", minWidth: "140px" }}>{n.userName}</span>
                                      <span>{n.userEmail}</span>
                                      <span style={{ color: "#c9933a", fontWeight: 500 }}>{n.desiredQuantity} units</span>
                                      <span>{new Date(n.createdAt).toLocaleDateString("en-IN")}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
            </div>
          )}
        </div>
      )}

      {/* Category Visibility panel */}
      <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "28px 32px" }}>
        <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "6px" }}>Category Visibility</p>
        <p style={{ fontSize: "13px", color: "#6E6E73", marginBottom: "20px" }}>Control which product categories are visible on the public site.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {adminCategories.map((cat) => (
            <div key={cat.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#F9F9FB", borderRadius: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#0B1F3A" }}>{cat.name}</span>
                <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 10px", borderRadius: "999px", background: cat.isPublic ? "#f0fdf4" : "#F5F5F7", color: cat.isPublic ? "#16a34a" : "#9CA3AF" }}>
                  {cat.isPublic ? "Visible on site" : "Hidden from public"}
                </span>
              </div>
              <button onClick={() => handleToggleCategoryPublic(cat)}
                style={{ background: "none", border: "none", cursor: "pointer", color: cat.isPublic ? "#16a34a" : "#9CA3AF", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 500 }}>
                {cat.isPublic ? (
                  <><Eye size={15} /> Hide</>
                ) : (
                  <><EyeOff size={15} /> Show</>
                )}
              </button>
            </div>
          ))}
          {adminCategories.length === 0 && <p style={{ fontSize: "13px", color: "#9CA3AF" }}>No categories found</p>}
        </div>
      </div>
    </div>
  );
}
