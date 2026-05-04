"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, ChevronDown, Heart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { renderAvatar } from "@/components/avatars/AvatarOptions";

interface AuthUser { name: string; email: string; avatar?: string | null; role?: string; }

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showHospital, setShowHospital] = useState(false);

  useEffect(() => {
    fetch("/api/settings/hospital-visibility")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.showInNav) setShowHospital(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      fetch("/api/auth/me").then((r) => r.ok ? r.json() : null).then((d) => {
        if (d?.wishlist) setWishlistCount(d.wishlist.length);
      }).catch(() => {});
    } else {
      setWishlistCount(0);
    }
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Fetch auth state
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, [pathname]);

  // Show cart restored toast
  useEffect(() => {
    if (sessionStorage.getItem("cartRestored") === "true") {
      sessionStorage.removeItem("cartRestored");
      // Small delay to let the page settle
      setTimeout(() => {
        const { useToastStore } = require("@/store/toastStore");
        useToastStore.getState().addToast("success", "Welcome back! Your cart has been restored.");
      }, 500);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const handleSignOut = async () => {
    if (cartItems.length > 0) {
      setShowLogoutModal(true);
      setUserDropdown(false);
      return;
    }
    await doSignOut();
  };

  const doSignOut = async () => {
    // Save cart to localStorage if user has email
    if (cartItems.length > 0 && user?.email) {
      localStorage.setItem("auberon_saved_cart", JSON.stringify({ email: user.email, items: cartItems }));
    }
    clearCart();
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setUserDropdown(false);
    setShowLogoutModal(false);
    window.location.href = "/";
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    ...(showHospital ? [{ href: "/hospital", label: "Hospital" }] : []),
    { href: "/shop", label: "Order" },
    { href: "/partners", label: "Partners" },
    { href: "/support", label: "Support" },
  ];

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !mobileOpen;
  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <>
      <nav
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-300",
        transparent
          ? "bg-transparent"
          : "bg-white/90 backdrop-blur-xl border-b border-black/[0.06]"
      )}
      style={{ top: "var(--banner-h, 0px)" }}
      aria-label="Main navigation"
    >
      <div className="container-premium">
        <div className="flex items-center justify-between h-[3.75rem] md:h-[4.25rem]">

          {/* Logo */}
          <Link href="/" className="flex flex-col shrink-0" aria-label="Auberon Pharmaceuticals">
            <span className={cn(
              "font-display text-[1.05rem] md:text-[1.15rem] font-bold leading-tight tracking-wide transition-colors duration-300",
              transparent ? "text-white" : "text-primary"
            )}>
              Auberon Pharmaceuticals
            </span>
            <span className="text-[8px] text-accent tracking-[0.2em] uppercase font-medium mt-0.5">
              Chandra Pharma
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[14px] font-medium transition-colors duration-200",
                  pathname === link.href
                    ? "text-accent"
                    : transparent
                      ? "text-white/75 hover:text-white"
                      : "text-muted hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-3 ml-1">
              {user && (
                <Link href="/wishlist"
                  className={cn("relative p-1.5 transition-colors", transparent ? "text-white/75 hover:text-white" : "text-muted hover:text-primary")}
                  aria-label={`Wishlist — ${wishlistCount} items`}>
                  <Heart size={16} strokeWidth={1.5} />
                  {wishlistCount > 0 && (
                    <span style={{ position: "absolute", top: "-2px", right: "-2px", minWidth: "18px", height: "18px", padding: "0 5px", background: "#c9933a", color: "white", fontSize: "10px", fontWeight: 600, borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </Link>
              )}
              <Link href="/shop"
                className={cn("relative p-1.5 transition-colors", transparent ? "text-white/75 hover:text-white" : "text-muted hover:text-primary")}
                aria-label={`Cart — ${totalItems} items`}
              >
                <ShoppingBag size={16} strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span style={{ position: "absolute", top: "-2px", right: "-2px", minWidth: "18px", height: "18px", padding: "0 5px", background: "#c9933a", color: "white", fontSize: "10px", fontWeight: 600, borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Auth area */}
              {user ? (
                <div ref={dropdownRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: "999px", maxWidth: "200px" }}
                    className={cn("transition-colors", transparent ? "hover:bg-white/10" : "hover:bg-black/[0.04]")}
                    aria-label="User menu"
                  >
                    <span style={{ width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {renderAvatar(user.avatar, 28)}
                    </span>
                    <div className="hidden md:flex" style={{ flexDirection: "column", alignItems: "flex-start", minWidth: 0, maxWidth: "100px" }}>
                      <span className={cn("text-[13px] font-medium", transparent ? "text-white/85" : "text-primary")}
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100px", display: "block" }}>
                        {firstName}
                      </span>
                      {user.role && (
                        <span style={{
                          fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "999px",
                          background: user.role === "wholesaler" ? "#c9933a" : user.role === "clinic" ? "#0d9488" : "#6b7280",
                          color: "white", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block",
                        }}>
                          {user.role === "wholesaler" ? "Wholesaler" : user.role === "clinic" ? "Clinic" : "Customer"}
                        </span>
                      )}
                    </div>
                    <ChevronDown size={13} className={cn("shrink-0", transparent ? "text-white/60" : "text-muted")} />
                  </button>
                  <AnimatePresence>
                    {userDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "white", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", minWidth: "160px", overflow: "hidden", zIndex: 100 }}
                      >
                        <Link href="/profile" onClick={() => setUserDropdown(false)}
                          style={{ display: "block", padding: "12px 16px", fontSize: "13px", color: "#0B1F3A", textDecoration: "none" }}
                          className="hover:bg-[#F5F5F7] transition-colors">
                          Account
                        </Link>
                        <Link href="/wishlist" onClick={() => setUserDropdown(false)}
                          style={{ display: "block", padding: "12px 16px", fontSize: "13px", color: "#0B1F3A", textDecoration: "none" }}
                          className="hover:bg-[#F5F5F7] transition-colors">
                          Wishlist {wishlistCount > 0 && <span style={{ fontSize: "11px", background: "#c9933a", color: "white", borderRadius: "999px", padding: "1px 7px", marginLeft: "6px" }}>{wishlistCount}</span>}
                        </Link>
                        <div style={{ height: "1px", background: "rgba(0,0,0,0.06)", margin: "0 12px" }} />
                        <button onClick={handleSignOut}
                          style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", fontSize: "13px", color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}
                          className="hover:bg-red-50 transition-colors">
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={cn("text-[13px] font-medium transition-colors duration-200", transparent ? "text-white/75 hover:text-white" : "text-muted hover:text-primary")}
                >
                  Sign In
                </Link>
              )}

              <Link
                href="/shop"
                className="rounded-full text-white font-medium text-[13px] transition-all duration-200"
                style={{ backgroundColor: "#C9963E", padding: "10px 28px" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b07e2e")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#C9963E")}
              >
                Order Now
              </Link>
            </div>
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-1">
            <Link
              href="/shop"
              className={cn("relative p-2", transparent ? "text-white/80" : "text-muted")}
              aria-label={`Cart — ${totalItems} items`}
            >
              <ShoppingBag size={17} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span style={{ position: "absolute", top: "2px", right: "2px", minWidth: "16px", height: "16px", padding: "0 4px", background: "#c9933a", color: "white", fontSize: "9px", fontWeight: 600, borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn("p-2", transparent ? "text-white/80" : "text-primary")}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-black/[0.06] overflow-hidden"
          >
            <div className="container-premium py-3 space-y-0.5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block py-2.5 px-3 rounded-xl text-[15px] font-medium transition-colors",
                    pathname === link.href
                      ? "text-accent"
                      : "text-primary/70 hover:text-primary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link href="/profile" className="block py-2.5 px-3 rounded-xl text-[15px] font-medium text-primary/70 hover:text-primary transition-colors">
                    Account
                  </Link>
                  <button onClick={handleSignOut} className="block w-full text-left py-2.5 px-3 rounded-xl text-[15px] font-medium text-red-500 hover:bg-red-50 transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" className="block py-2.5 px-3 rounded-xl text-[15px] font-medium text-primary/70 hover:text-primary transition-colors">
                  Sign In
                </Link>
              )}
              <div className="pt-2 pb-1">
                <Link
                  href="/shop"
                  className="block text-center bg-primary text-white rounded-full py-2.5 text-[14px] font-medium"
                >
                  Order Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

    {/* Logout confirmation modal */}
    <AnimatePresence>
      {showLogoutModal && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }}
            onClick={() => setShowLogoutModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "white", borderRadius: "20px", padding: "36px 32px", maxWidth: "400px", width: "90%", zIndex: 201, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.4rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "12px" }}>Before you go…</p>
            <p style={{ fontSize: "14px", color: "#6E6E73", lineHeight: 1.6, marginBottom: "24px" }}>
              You have {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart. Your cart will be saved and restored when you sign back in.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={doSignOut} className="btn-primary btn-gold" style={{ flex: 1, fontSize: "13px", padding: "11px 16px" }}>Sign Out Anyway</button>
              <button onClick={() => setShowLogoutModal(false)} style={{ flex: 1, fontSize: "13px", padding: "11px 16px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.12)", background: "transparent", cursor: "pointer", color: "#6E6E73", fontWeight: 500 }}>Stay Signed In</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}