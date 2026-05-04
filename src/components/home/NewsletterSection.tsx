"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const validate = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.status === 400 && data.error === "You are already subscribed") {
        setStatus("error");
        setMessage("This email is already subscribed");
        return;
      }
      if (!res.ok) throw new Error(data.error || "error");
      setStatus("success");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section style={{ background: "#1a2744", paddingTop: "80px", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", paddingLeft: "2rem", paddingRight: "2rem", textAlign: "center" }}>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9963E", marginBottom: "1.25rem" }}
        >
          Stay Updated
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontWeight: 700, color: "white", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.12, marginBottom: "1.25rem" }}
        >
          Join our community.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.14 }}
          style={{ fontSize: "15px", color: "rgba(255,255,255,0.55)", lineHeight: "1.75", marginBottom: "2.5rem" }}
        >
          Get product updates, eye health tips, and exclusive offers delivered to your inbox.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {status === "success" ? (
            <p style={{ fontSize: "15px", color: "#C9963E", fontWeight: 500 }}>
              You&apos;re subscribed! Thank you for joining us.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
                  placeholder="Enter your email address"
                  style={{
                    flex: "1 1 260px", minWidth: "0", padding: "14px 20px",
                    borderRadius: "8px", border: "none", fontSize: "1rem",
                    background: "white", color: "#0B1F3A", outline: "none",
                  }}
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  style={{
                    padding: "14px 28px", borderRadius: "8px", border: "none",
                    background: "#C9963E", color: "white", fontSize: "1rem",
                    fontWeight: 600, cursor: status === "loading" ? "not-allowed" : "pointer",
                    opacity: status === "loading" ? 0.7 : 1,
                    display: "flex", alignItems: "center", gap: "8px",
                    flexShrink: 0, transition: "opacity 0.2s",
                  }}
                  aria-label="Subscribe"
                >
                  {status === "loading" && <Loader2 size={15} className="animate-spin" />}
                  {status === "loading" ? "Subscribing..." : "Subscribe"}
                </button>
              </div>
              {status === "error" && message && (
                <p style={{ marginTop: "10px", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                  {message}
                </p>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
