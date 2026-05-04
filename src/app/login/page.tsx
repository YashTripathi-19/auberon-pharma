"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let recaptchaToken: string | undefined;
      if (executeRecaptcha) {
        try {
          recaptchaToken = await executeRecaptcha("login");
        } catch {
          console.warn("[login] reCAPTCHA execution failed, proceeding without token");
        }
      }
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...(recaptchaToken ? { recaptchaToken } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      // Restore saved cart if email matches
      try {
        const saved = localStorage.getItem("auberon_saved_cart");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.email === form.email && Array.isArray(parsed.items) && parsed.items.length > 0) {
            // Import cart store dynamically to avoid SSR issues
            const { useCartStore } = await import("@/store/cartStore");
            const store = useCartStore.getState();
            for (const item of parsed.items) {
              store.addItem({ productId: item.productId, productName: item.productName, price: item.price, image: item.image });
              store.updateQuantity(item.productId, item.quantity);
            }
            localStorage.removeItem("auberon_saved_cart");
            // Show toast after redirect
            sessionStorage.setItem("cartRestored", "true");
          }
        }
      } catch { /* non-fatal */ }
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const label = { display: "block", fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "8px" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ width: "100%", maxWidth: "420px", background: "white", borderRadius: "24px", border: "1px solid rgba(0,0,0,0.06)", padding: "48px 40px", boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}
    >
      <p style={{ fontSize: "11px", color: "#C9963E", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "10px" }}>Welcome back</p>
      <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2.2rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "8px", lineHeight: 1.1 }}>Sign in</h1>
      <p style={{ fontSize: "14px", color: "#6E6E73", marginBottom: "32px", lineHeight: 1.6 }}>Sign in to track your orders and manage your account.</p>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", padding: "12px 16px", borderRadius: "12px", marginBottom: "24px" }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />{error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <label style={label}>Email <span style={{ color: "#f87171" }}>*</span></label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-premium" placeholder="you@example.com" required autoFocus />
        </div>
        <div>
          <label style={label}>Password <span style={{ color: "#f87171" }}>*</span></label>
          <div style={{ position: "relative" }}>
            <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-premium" placeholder="Your password" required style={{ paddingRight: "44px" }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6E6E73" }} aria-label="Toggle password">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary btn-gold" style={{ fontSize: "14px", padding: "14px 20px", width: "100%", marginTop: "4px", opacity: loading ? 0.6 : 1 }}>
          {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Loader2 size={15} className="animate-spin" />Signing in...</span> : "Sign In"}
        </button>
      </form>

      <p style={{ fontSize: "13px", color: "#6E6E73", textAlign: "center", marginTop: "28px" }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "#C9963E", textDecoration: "none", fontWeight: 500 }}>Sign up</Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}>
      <Navbar />
      <main className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "6rem 1.5rem 4rem" }}>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </GoogleReCaptchaProvider>
  );
}
