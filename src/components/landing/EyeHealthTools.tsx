"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function EyeHealthTools() {
  return (
    <section style={{ background: "#f8f7f4", padding: "80px 0" }}>
      <div className="container-premium">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: "center", marginBottom: "48px" }}>
          <p className="section-label" style={{ display: "block", marginBottom: "12px" }}>Eye Health Tools</p>
          <h2 className="section-title text-[2rem] md:text-[2.4rem]">Check your vision health.</h2>
          <p style={{ color: "var(--color-muted)", fontSize: "15px", lineHeight: "1.75", maxWidth: "520px", margin: "16px auto 0" }}>
            Try our free preliminary eye health screening tools — developed to help you understand your vision better.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Card 1 — Colour Blindness Test */}
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ background: "white", borderRadius: "12px", padding: "32px", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(201,147,62,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9933a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "8px" }}>Colour Blindness Test</h3>
              <p style={{ fontSize: "13px", color: "#6E6E73", lineHeight: 1.7 }}>
                Take our Ishihara-style screening test to check for colour vision deficiencies. Takes under 2 minutes.
              </p>
            </div>
            <Link href="/eye-tests/colour-blindness"
              style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 24px", borderRadius: "999px", border: "1.5px solid #c9933a", background: "transparent", color: "#c9933a", fontSize: "13px", fontWeight: 600, textDecoration: "none", transition: "all 0.2s" }}
              className="hover:bg-accent hover:text-white hover:border-accent">
              Take the Test
            </Link>
          </motion.div>

          {/* Card 2 — Live Eye Scan */}
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ background: "white", borderRadius: "12px", padding: "32px", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(201,147,62,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9933a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "8px" }}>Live Eye Scan</h3>
              <p style={{ fontSize: "13px", color: "#6E6E73", lineHeight: 1.7 }}>
                Use your device camera for a preliminary AI-powered screening for conjunctivitis and cataract. Results in under 30 seconds.
              </p>
            </div>
            <Link href="/eye-tests/scan"
              style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 24px", borderRadius: "999px", border: "1.5px solid #c9933a", background: "#c9933a", color: "white", fontSize: "13px", fontWeight: 600, textDecoration: "none", transition: "all 0.2s" }}
              className="hover:opacity-90">
              Start Eye Scan
            </Link>
          </motion.div>
          {/* Card 3 — Eye Knowledge Hub */}
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            style={{ background: "white", borderRadius: "12px", padding: "32px", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(201,147,62,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9933a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "8px" }}>Eye Knowledge Hub</h3>
              <p style={{ fontSize: "13px", color: "#6E6E73", lineHeight: 1.7 }}>
                Explore interactive guides on myopia, hyperopia, conjunctivitis, cataract and vision correction options with a 3D eye model.
              </p>
            </div>
            <Link href="/eye-knowledge"
              style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 24px", borderRadius: "999px", border: "1.5px solid #c9933a", background: "transparent", color: "#c9933a", fontSize: "13px", fontWeight: 600, textDecoration: "none", transition: "all 0.2s" }}
              className="hover:bg-accent hover:text-white hover:border-accent">
              Explore Hub
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
