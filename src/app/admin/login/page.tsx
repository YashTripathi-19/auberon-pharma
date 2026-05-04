"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  { text: "Fortune favours the prepared.", author: "Auberon Pharmaceuticals" },
  { text: "Clarity in every decision.", author: "Admin Portal" },
  { text: "Precision is the soul of medicine.", author: "Chandra Pharma" },
  { text: "Every drop counts.", author: "Ophthalmic Care Since 2010" },
  { text: "Trust is built one batch at a time.", author: "GMP Certified Manufacturing" },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [paused]);

  const goTo = (i: number) => {
    setQuoteIndex(i);
    setPaused(true);
    setTimeout(() => setPaused(false), 8000); // resume after 8s
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid credentials");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", overflow: "hidden" }}>

      {/* ── Left fills remaining space: navy + form ── */}
      <div style={{ flex: 1, display: "flex", minWidth: 0 }}>

        {/* Navy branding panel */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="hidden lg:flex"
          style={{
            width: "380px",
            flexShrink: 0,
            background: "#0B1F3A",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 52px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="absolute inset-0 dot-grid opacity-10" />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 30% 50%, rgba(201,150,62,0.07), transparent)" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: "white", letterSpacing: "0.04em" }}>Auberon</p>
            <p style={{ fontSize: "9px", color: "#C9963E", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, marginTop: "4px" }}>Pharmaceuticals</p>
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: "11px", color: "#C9963E", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "20px" }}>Admin Portal</p>
            <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(1.8rem, 2.8vw, 2.8rem)", fontWeight: 700, color: "white", lineHeight: 1.12, marginBottom: "24px" }}>
              Clarity in every<br /><span style={{ color: "#C9963E" }}>decision.</span>
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: "1.8", maxWidth: "280px" }}>
              Manage your product catalogue, track orders, and monitor business performance — all in one place.
            </p>
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ width: "32px", height: "1px", background: "rgba(201,150,62,0.4)", marginBottom: "16px" }} />
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>&ldquo;Fortune favours the prepared.&rdquo;</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", marginTop: "4px" }}>— Auberon Pharmaceuticals, est. 2010</p>
          </div>
        </motion.div>

        {/* White form panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            flex: 1,
            background: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "48px 40px",
          }}
        >
          <div className="lg:hidden" style={{ marginBottom: "40px", textAlign: "center" }}>
            <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: "#0B1F3A" }}>Auberon</p>
            <p style={{ fontSize: "9px", color: "#C9963E", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginTop: "4px" }}>Admin Portal</p>
          </div>

          <div style={{ maxWidth: "360px", width: "100%" }}>
            <p style={{ fontSize: "11px", color: "#C9963E", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "12px" }}>Welcome back</p>
            <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2.4rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "8px", lineHeight: 1.1 }}>Sign in</h1>
            <p style={{ fontSize: "14px", color: "#6E6E73", marginBottom: "36px", lineHeight: 1.6 }}>Enter your admin password to access the dashboard.</p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", padding: "12px 16px", borderRadius: "12px", marginBottom: "24px" }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label htmlFor="password" style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-premium"
                    style={{ paddingRight: "44px" }}
                    placeholder="Enter admin password"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6E6E73", padding: "4px" }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !password}
                className="btn-primary btn-gold"
                style={{ fontSize: "14px", padding: "14px 20px", width: "100%", opacity: (loading || !password) ? 0.5 : 1, cursor: (loading || !password) ? "not-allowed" : "pointer" }}
                aria-label="Sign in"
              >
                {loading
                  ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Loader2 size={15} className="animate-spin" /> Signing in...</span>
                  : "Sign In"}
              </button>
            </form>

            <p style={{ fontSize: "12px", color: "#AEAEB2", textAlign: "center", marginTop: "32px" }}>
              © {new Date().getFullYear()} Auberon Pharmaceuticals. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Right 25%: quotes panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: "280px",
          flexShrink: 0,
          background: "#F8F7F4",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 36px",
          position: "relative",
          overflow: "hidden",
          borderLeft: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {/* Static decorative rings */}
        <div style={{ position: "absolute", width: "320px", height: "320px", borderRadius: "50%", border: "1px solid rgba(11,31,58,0.05)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "200px", height: "200px", borderRadius: "50%", border: "1px solid rgba(11,31,58,0.06)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "100px", height: "100px", borderRadius: "50%", border: "1px solid rgba(201,150,62,0.15)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

        {/* Quote content — fixed height so layout never shifts */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "4rem", color: "#C9963E", opacity: 0.2, lineHeight: 1, marginBottom: "-8px" }}>&ldquo;</p>

          {/* Fixed-height container — quotes swap inside, no layout shift */}
          <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                style={{ textAlign: "center", padding: "0 8px" }}
              >
                <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.25rem", fontWeight: 600, color: "#0B1F3A", lineHeight: 1.45, marginBottom: "16px" }}>
                  {quotes[quoteIndex].text}
                </p>
                <p style={{ fontSize: "10px", color: "#C9963E", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  — {quotes[quoteIndex].author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Clickable dot indicators */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "28px" }}>
            {quotes.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to quote ${i + 1}`}
                style={{
                  width: i === quoteIndex ? "22px" : "7px",
                  height: "7px",
                  borderRadius: "999px",
                  background: i === quoteIndex ? "#C9963E" : "rgba(11,31,58,0.18)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.35s ease",
                }}
              />
            ))}
          </div>
        </div>

        <p style={{ position: "absolute", bottom: "28px", fontSize: "10px", color: "rgba(11,31,58,0.18)", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>
          Auberon · Est. 2010
        </p>
      </div>
    </div>
  );
}
