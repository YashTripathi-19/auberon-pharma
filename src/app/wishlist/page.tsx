"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Product } from "@/types/product";
import { RestockNotification } from "@/types/restock";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { formatCurrency } from "@/lib/utils";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export default function WishlistPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [restockNotifs, setRestockNotifs] = useState<RestockNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifyExpanded, setNotifyExpanded] = useState<Record<string, boolean>>({});
  const [notifyQty, setNotifyQty] = useState<Record<string, string>>({});
  const [notifySet, setNotifySet] = useState<Record<string, boolean>>({});
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => { if (r.status === 401) { router.replace("/login?redirect=/wishlist"); return null; } return r.json(); }),
      fetch("/api/admin/products").then((r) => r.ok ? r.json() : []),
      fetch("/api/auth/restock-notifications").then((r) => r.ok ? r.json() : []),
    ]).then(([user, allProducts, notifs]) => {
      if (!user) return;
      setUserEmail(user.email || "");
      const ids: string[] = user.wishlist || [];
      setWishlistIds(ids);
      setProducts((allProducts as Product[]).filter((p: Product) => ids.includes(p.id)));
      setRestockNotifs(notifs || []);
    }).finally(() => setLoading(false));
  }, [router]);

  const handleRemove = async (productId: string) => {
    await fetch("/api/auth/wishlist/toggle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    addToast("success", "Removed from wishlist");
  };

  const handleAddToCart = (product: Product) => {
    addItem({ productId: product.id, productName: product.name, price: product.price, image: product.images[0] });
    addToast("success", `${product.name} added to cart`);
    router.push("/shop");
  };

  const handleSetNotify = async (productId: string, productName: string) => {
    const qty = parseInt(notifyQty[productId] || "1", 10) || 1;
    const res = await fetch("/api/products/restock-notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, desiredQuantity: qty }) });
    if (res.ok) {
      setNotifySet((p) => ({ ...p, [productId]: true }));
      setNotifyExpanded((p) => ({ ...p, [productId]: false }));
      addToast("success", `You'll be notified when ${productName} is back in stock`);
    }
  };

  const handleCancelNotify = async (productId: string) => {
    await fetch("/api/products/restock-notify", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    setRestockNotifs((prev) => prev.filter((n) => n.productId !== productId));
    setNotifySet((p) => ({ ...p, [productId]: false }));
    addToast("success", "Notification cancelled");
  };

  const getNotif = (productId: string) => restockNotifs.find((n) => n.productId === productId);

  return (
    <>
      <Navbar />
      <main className="page-content" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div className="container-premium">
          <div style={{ marginBottom: "48px", textAlign: "center" }}>
            <p className="section-label" style={{ display: "block", marginBottom: "12px" }}>Saved Items</p>
            <h1 className="section-title text-[2rem] md:text-[2.8rem]" style={{ marginBottom: "16px" }}>My Wishlist</h1>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
              {[1, 2, 3].map((i) => <div key={i} className="animate-pulse bg-gray-100 rounded-2xl" style={{ height: "280px" }} />)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Heart size={48} style={{ color: "#e5e7eb", margin: "0 auto 16px" }} />
              <p style={{ fontSize: "18px", fontWeight: 600, color: "#0B1F3A", marginBottom: "8px" }}>Your wishlist is empty</p>
              <p style={{ fontSize: "14px", color: "#6E6E73", marginBottom: "24px" }}>Save products you love to find them easily later.</p>
              <Link href="/products" className="btn-primary btn-gold" style={{ fontSize: "13px", padding: "12px 28px" }}>Browse Products</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
              {products.map((product) => {
                const outOfStock = product.stock === 0;
                const notif = getNotif(product.id);
                const isNotifySet = notifySet[product.id] || !!notif;
                const expanded = notifyExpanded[product.id];

                return (
                  <div key={product.id} className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden flex flex-col">
                    <div className="bg-[#F5F5F7] flex items-center justify-center relative" style={{ height: "140px", padding: "1.5rem" }}>
                      <p className="font-display font-semibold text-primary/20 text-center" style={{ fontSize: "0.95rem" }}>{product.name}</p>
                      {outOfStock && (
                        <span style={{ position: "absolute", top: "14px", right: "14px", fontSize: "10px", fontWeight: 600, padding: "4px 12px", borderRadius: "999px", background: "#fef2f2", color: "#ef4444" }}>Out of stock</span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1" style={{ padding: "20px" }}>
                      <h3 className="font-display font-semibold text-primary" style={{ fontSize: "1rem", marginBottom: "8px" }}>{product.name}</h3>
                      <p style={{ fontSize: "13px", color: "#6E6E73", marginBottom: "12px", flex: 1 }}>{product.category}</p>

                      {/* Restock notification section for out-of-stock items */}
                      {outOfStock && (
                        <div style={{ marginBottom: "12px" }}>
                          {isNotifySet ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "12px", color: "#c9933a", fontWeight: 500 }}>
                                🔔 Notified for {notif?.desiredQuantity || notifyQty[product.id] || "1"} units
                              </span>
                              <button onClick={() => handleCancelNotify(product.id)}
                                style={{ fontSize: "11px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                                Cancel notification
                              </button>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => setNotifyExpanded((p) => ({ ...p, [product.id]: !p[product.id] }))}
                                style={{ fontSize: "12px", color: "#c9933a", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                                Notify me when available
                              </button>
                              <AnimatePresence>
                                {expanded && (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                                    <div style={{ paddingTop: "8px", display: "flex", gap: "6px", alignItems: "center" }}>
                                      <input type="number" min="1" value={notifyQty[product.id] || "1"}
                                        onChange={(e) => setNotifyQty((p) => ({ ...p, [product.id]: e.target.value }))}
                                        onFocus={(e) => e.target.select()}
                                        style={{ width: "64px", padding: "5px 8px", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "6px", fontSize: "12px", textAlign: "center" }}
                                        placeholder="Qty" />
                                      <button onClick={() => handleSetNotify(product.id, product.name)} className="btn-primary btn-gold" style={{ fontSize: "11px", padding: "5px 12px" }}>
                                        Set
                                      </button>
                                    </div>
                                    {userEmail && <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>Email: {userEmail}</p>}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          )}
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                        <span className="font-numeric font-bold text-primary" style={{ fontSize: "1.2rem" }}>{formatCurrency(product.price)}</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleRemove(product.id)}
                            style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#fef2f2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            aria-label="Remove from wishlist">
                            <Heart size={14} fill="#dc2626" stroke="#dc2626" />
                          </button>
                          <button onClick={() => handleAddToCart(product)} disabled={outOfStock}
                            className="btn-primary btn-gold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ gap: "6px", padding: "8px 16px", fontSize: "12px" }}>
                            <ShoppingBag size={12} /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
