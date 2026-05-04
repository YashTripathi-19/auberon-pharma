"use client";
import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { formatCurrency } from "@/lib/utils";
import CartSidebar from "@/components/shop/CartSidebar";
import { Search, Plus, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ShopPageClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [roleDiscount, setRoleDiscount] = useState<{ percentage: number; role: string } | null>(null);
  const [publicCategories, setPublicCategories] = useState<string[]>([]);
  const [fbtSuggestions, setFbtSuggestions] = useState<{ productId: string; name: string; price: number }[]>([]);
  const [fbtVisible, setFbtVisible] = useState(false);
  // Stock failure panel state: productId → { wishlistSaved, notifyQty, notifySet, notifyExpanded, dismissed }
  const [stockPanels, setStockPanels] = useState<Record<string, { wishlistSaved: boolean; notifyQty: string; notifySet: boolean; notifyExpanded: boolean; dismissed: boolean }>>({});
  const [userWishlist, setUserWishlist] = useState<string[]>([]);
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const addToast = useToastStore((s) => s.addToast);
  const setCapCallback = useCartStore((s) => s.setCapCallback);

  useEffect(() => {
    setCapCallback((name, cap) => addToast("info", `Only ${cap} unit${cap !== 1 ? "s" : ""} available — quantity capped`));
  }, [setCapCallback, addToast]);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.ok ? r.json() : null),
      fetch("/api/settings/role-discounts").then((r) => r.ok ? r.json() : null),
      fetch("/api/categories").then((r) => r.ok ? r.json() : []),
    ]).then(([user, discounts, cats]) => {
      setIsLoggedIn(!!user);
      setAuthChecked(true);
      setPublicCategories((cats as { name: string }[]).map((c) => c.name));
      if (user) {
        setUserEmail(user.email || "");
        setUserWishlist(user.wishlist || []);
      }
      if (user && discounts) {
        const rd = discounts[user.role as keyof typeof discounts] as { percentage: number; isActive: boolean } | undefined;
        if (rd?.isActive && rd.percentage > 0) {
          setRoleDiscount({ percentage: rd.percentage, role: user.role });
        }
      }
    }).catch(() => { setAuthChecked(true); });
  }, []);

  // Clear FBT strip when cart is emptied
  useEffect(() => {
    if (items.length === 0) setFbtVisible(false);
  }, [items.length]);

  // Only show products from public categories
  const visibleProducts = publicCategories.length > 0
    ? products.filter((p) => publicCategories.includes(p.category))
    : products;

  const categories = ["All", ...Array.from(new Set(visibleProducts.map((p) => p.category)))];

  const filtered = visibleProducts.filter((p) => {
    if (activeCategory !== "All" && p.category !== activeCategory) return false;
    return p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
  });

  const handleAdd = (product: Product) => {
    if (product.stock === 0) {
      // Show stock failure panel instead
      setStockPanels((prev) => ({
        ...prev,
        [product.id]: { ...(prev[product.id] || {}), wishlistSaved: prev[product.id]?.wishlistSaved ?? userWishlist.includes(product.id), notifyQty: prev[product.id]?.notifyQty ?? "1", notifySet: prev[product.id]?.notifySet ?? false, notifyExpanded: prev[product.id]?.notifyExpanded ?? false, dismissed: false },
      }));
      return;
    }
    addItem({ productId: product.id, productName: product.name, price: product.price, image: product.images[0], stock: product.stock });
    addToast("success", `${product.name} added to cart`);
    // Fetch FBT suggestions — strip stays until dismissed or checkout
    fetch(`/api/products/frequently-bought-together?productId=${product.id}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: { id: string; name: string; price: number }[]) => {
        const suggestions = data
          .filter((p) => !items.some((i) => i.productId === p.id) && p.id !== product.id)
          .slice(0, 3)
          .map((p) => ({ productId: p.id, name: p.name, price: p.price }));
        if (suggestions.length > 0) {
          setFbtSuggestions(suggestions);
          setFbtVisible(true);
          // No auto-dismiss — stays until user dismisses or checks out
        }
      }).catch(() => {});
  };

  const handleCheckout = () => {
    setFbtVisible(false); // clear FBT on checkout
    if (!isLoggedIn) { router.push("/login?redirect=/checkout"); return; }
    router.push("/checkout");
  };

  const inCart = (id: string) => items.some((i) => i.productId === id);

  const handleWishlistFromPanel = async (product: Product) => {
    if (!isLoggedIn) { addToast("info", "Sign in to save to wishlist"); router.push("/login"); return; }
    const res = await fetch("/api/auth/wishlist/toggle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
    if (res.ok) {
      const data = await res.json();
      setStockPanels((prev) => ({ ...prev, [product.id]: { ...prev[product.id], wishlistSaved: data.added } }));
      setUserWishlist(data.wishlist);
    }
  };

  const handleSetNotify = async (product: Product) => {
    if (!isLoggedIn) { addToast("info", "Sign in to get notified"); router.push("/login"); return; }
    const qty = parseInt(stockPanels[product.id]?.notifyQty || "1", 10) || 1;
    const res = await fetch("/api/products/restock-notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, desiredQuantity: qty }) });
    if (res.ok) {
      setStockPanels((prev) => ({ ...prev, [product.id]: { ...prev[product.id], notifySet: true, notifyExpanded: false } }));
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-6">

        {/* Product selector */}
        <div className="bg-white rounded-2xl border border-black/[0.06]" style={{ padding: "32px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "20px", paddingTop: "4px" }}>
            <p className="font-display text-[1.05rem] font-semibold text-primary">Select Products</p>
            <span className="text-[12px] text-muted">{filtered.length} available</span>
          </div>

          <div className="relative" style={{ marginBottom: "20px" }}>
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input-premium" style={{ paddingLeft: "44px" }} aria-label="Search products" />
          </div>

          <div className="flex flex-wrap gap-2" style={{ marginBottom: "24px" }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={cn("rounded-full font-medium transition-all duration-200", activeCategory === cat ? "bg-accent text-white" : "bg-[#F5F5F7] text-muted hover:text-primary")}
                style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "999px" }}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => {
                const added = inCart(product.id);
                const discountedPrice = roleDiscount ? product.price * (1 - roleDiscount.percentage / 100) : null;
                const panel = stockPanels[product.id];
                const showPanel = panel && !panel.dismissed && product.stock === 0;
                return (
                  <React.Fragment key={product.id}>
                    <motion.button layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }}
                      onClick={() => !added && handleAdd(product)}
                      className={cn("text-left rounded-xl border transition-all duration-200", added ? "border-accent/30 bg-accent/5 cursor-default" : product.stock === 0 ? "border-black/[0.06] bg-white cursor-pointer opacity-70" : "border-black/[0.06] bg-white hover:border-primary/20 hover:shadow-sm cursor-pointer")}
                      style={{ padding: "16px 18px" }} aria-label={added ? `${product.name} in cart` : `Add ${product.name}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-primary truncate">{product.name}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
                            <p className="text-[12px] text-muted">{product.category}</p>
                            {discountedPrice ? (
                              <>
                                <span style={{ fontSize: "11px", color: "#9CA3AF", textDecoration: "line-through" }}>{formatCurrency(product.price)}</span>
                                <span style={{ fontSize: "12px", fontWeight: 700, color: "#c9933a" }}>{formatCurrency(Math.round(discountedPrice))}</span>
                                <span style={{ fontSize: "10px", fontWeight: 600, background: "#f0fdf4", color: "#16a34a", padding: "1px 6px", borderRadius: "999px" }}>{roleDiscount!.percentage}% off</span>
                              </>
                            ) : (
                              <span className="text-[12px] text-muted">· {formatCurrency(product.price)}</span>
                            )}
                          </div>
                          {product.stock === 0
                            ? <span className="inline-block text-[10px] text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-full" style={{ marginTop: "8px" }}>Out of stock</span>
                            : product.stock < 20
                            ? <span className="inline-block text-[10px] text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-full" style={{ marginTop: "8px" }}>Low stock</span>
                            : null}
                        </div>
                        <div className={cn("shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all", added ? "bg-accent/20 text-accent" : product.stock === 0 ? "bg-red-50 text-red-400" : "bg-[#F5F5F7] text-muted")}>
                          {added ? <Check size={14} /> : product.stock === 0 ? <X size={14} /> : <Plus size={14} />}
                        </div>
                      </div>
                    </motion.button>

                    {/* Stock failure panel */}
                    <AnimatePresence>
                      {showPanel && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          style={{ gridColumn: "1 / -1", background: "#fdf6e3", border: "1px solid #c9933a", borderRadius: "8px", padding: "16px", position: "relative", overflow: "hidden" }}>
                          <button onClick={() => setStockPanels((p) => ({ ...p, [product.id]: { ...p[product.id], dismissed: true } }))}
                            style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }} aria-label="Dismiss">
                            <X size={14} />
                          </button>
                          <p style={{ fontSize: "13px", color: "#92400e", marginBottom: "12px", paddingRight: "20px" }}>
                            This item is currently out of stock or you&apos;ve reached the maximum available quantity.
                          </p>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: panel.notifyExpanded ? "12px" : "0" }}>
                            {/* Wishlist button */}
                            <button onClick={() => handleWishlistFromPanel(product)}
                              style={{ fontSize: "12px", fontWeight: 600, padding: "7px 14px", borderRadius: "999px", border: `1.5px solid ${panel.wishlistSaved ? "#16a34a" : "#c9933a"}`, background: "transparent", color: panel.wishlistSaved ? "#16a34a" : "#c9933a", cursor: "pointer" }}>
                              {panel.wishlistSaved ? "✓ Saved to Wishlist" : "Save to Wishlist"}
                            </button>
                            {/* Notify button */}
                            {!panel.notifySet ? (
                              <button onClick={() => { if (!isLoggedIn) { addToast("info", "Sign in to get notified"); router.push("/login"); return; } setStockPanels((p) => ({ ...p, [product.id]: { ...p[product.id], notifyExpanded: !p[product.id].notifyExpanded } })); }}
                                style={{ fontSize: "12px", fontWeight: 600, padding: "7px 14px", borderRadius: "999px", border: "1.5px solid #1a2744", background: "transparent", color: "#1a2744", cursor: "pointer" }}>
                                Notify Me When Available
                              </button>
                            ) : (
                              <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                                ✓ You&apos;ll be notified at {userEmail}
                              </span>
                            )}
                          </div>
                          {/* Notify form */}
                          <AnimatePresence>
                            {panel.notifyExpanded && !panel.notifySet && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                                <div style={{ paddingTop: "10px" }}>
                                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#92400e", display: "block", marginBottom: "6px" }}>How many units do you need?</label>
                                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <input type="number" min="1" value={panel.notifyQty}
                                      onChange={(e) => setStockPanels((p) => ({ ...p, [product.id]: { ...p[product.id], notifyQty: e.target.value } }))}
                                      onFocus={(e) => e.target.select()}
                                      style={{ width: "80px", padding: "7px 10px", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "8px", fontSize: "13px", textAlign: "center" }}
                                      placeholder="Qty" />
                                    <button onClick={() => handleSetNotify(product)} className="btn-primary btn-gold" style={{ fontSize: "12px", padding: "7px 16px" }}>
                                      Set Notification
                                    </button>
                                  </div>
                                  {userEmail && <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "6px" }}>We&apos;ll email you at {userEmail}</p>}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="py-14 text-center">
              <p className="text-[14px] text-primary font-medium">No products found</p>
              <p className="text-[12px] text-muted mt-1">Try a different search or category</p>
            </div>
          )}
        </div>

        {/* FBT strip */}
        <AnimatePresence>
          {fbtVisible && fbtSuggestions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              style={{ background: "#1a2744", borderRadius: "16px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)", flexShrink: 0 }}>Customers also bought:</span>
              <div style={{ display: "flex", gap: "8px", flex: 1, flexWrap: "wrap" }}>
                {fbtSuggestions.map((s) => (
                  <button key={s.productId} onClick={() => { const p = products.find((x) => x.id === s.productId); if (p && !inCart(p.id)) handleAdd(p); }}
                    style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "999px", padding: "5px 12px", cursor: "pointer", transition: "all 0.15s" }}
                    className="hover:bg-white/20">
                    <span style={{ fontSize: "12px", color: "white", fontWeight: 500 }}>{s.name}</span>
                    <span style={{ fontSize: "11px", color: "#c9933a" }}>{formatCurrency(s.price)}</span>
                    <Plus size={11} style={{ color: "#c9933a" }} />
                  </button>
                ))}
              </div>
              <button onClick={() => setFbtVisible(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", flexShrink: 0 }} aria-label="Dismiss">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Checkout nudge */}
        {items.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-black/[0.06] text-center" style={{ padding: "32px 24px" }}>
            {authChecked && !isLoggedIn ? (
              <>
                <p className="font-display text-[1.1rem] font-semibold text-primary" style={{ marginBottom: "8px" }}>Sign in to place your order</p>
                <p className="text-[14px] text-muted" style={{ marginBottom: "24px" }}>Create a free account or sign in to continue.</p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/login?redirect=/checkout" className="btn-primary btn-gold text-[14px]" style={{ padding: "12px 28px" }}>Sign In</Link>
                  <Link href="/signup" className="btn-primary btn-navy text-[14px]" style={{ padding: "12px 28px" }}>Create Account</Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-[15px] text-primary font-medium" style={{ marginBottom: "20px" }}>
                  {items.length} item{items.length > 1 ? "s" : ""} in cart — ready to checkout?
                </p>
                <button onClick={handleCheckout} className="inline-flex items-center gap-2 btn-primary btn-gold text-[14px]" style={{ padding: "12px 28px" }}>
                  Proceed to Checkout
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Cart */}
      <div className="w-full lg:w-72 shrink-0">
        <CartSidebar onCheckout={handleCheckout} />
      </div>
    </div>
  );
}
