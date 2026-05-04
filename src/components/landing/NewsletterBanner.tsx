"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const channels = [
  {
    tag: "Wholesalers & Distributors",
    heading: "Partner with us for bulk supply.",
    body: "Competitive margins, reliable stock, and direct manufacturer pricing on our full ophthalmic range.",
    signupHref: "/signup/wholesale",
    signupLabel: "Sign Up as Wholesaler",
    enquireLabel: "Enquire first",
  },
  {
    tag: "Doctors & Clinics",
    heading: "Stock directly at your clinic.",
    body: "We handle delivery, documentation, and after-sales support so you can focus on your patients.",
    signupHref: "/signup/clinic",
    signupLabel: "Sign Up as Clinic",
    enquireLabel: "Enquire first",
  },
];

export default function NewsletterBanner() {
  return (
    <section style={{ background: "#F5F5F7", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "8rem", paddingBottom: "8rem" }}>
      <div style={{ maxWidth: "1080px", margin: "0 auto", paddingLeft: "2rem", paddingRight: "2rem", width: "100%" }}>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9963E", marginBottom: "1.25rem" }}
        >
          Work With Us
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          style={{ textAlign: "center", fontFamily: "Cormorant Garamond, Georgia, serif", fontWeight: 700, color: "#0B1F3A", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.12, marginBottom: "1.25rem" }}
        >
          Become a partner.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.14 }}
          style={{ textAlign: "center", fontSize: "15px", color: "#6E6E73", lineHeight: "1.75", maxWidth: "36rem", margin: "0 auto", marginBottom: "4rem" }}
        >
          We supply directly to wholesalers, hospitals, and ophthalmology clinics.
          If you&apos;re looking to stock quality ophthalmic products, let&apos;s talk.
        </motion.p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem", maxWidth: "720px", margin: "0 auto" }} className="grid grid-cols-1 md:grid-cols-2">
          {channels.map((c, i) => (
            <motion.div
              key={c.tag}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              style={{ background: "white", borderRadius: "1.25rem", border: "1px solid rgba(0,0,0,0.06)", padding: "3.5rem", display: "flex", flexDirection: "column" }}
            >
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C9963E", marginBottom: "1.25rem" }}>{c.tag}</p>
              <h3 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.2rem", fontWeight: 600, color: "#0B1F3A", lineHeight: 1.3, marginBottom: "1.25rem" }}>{c.heading}</h3>
              <p style={{ fontSize: "13px", color: "#6E6E73", lineHeight: "1.75", flex: 1, marginBottom: "2.25rem" }}>{c.body}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Link href={c.signupHref}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "12px 24px", borderRadius: "999px", background: "#c9933a", color: "white", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#b07e2e")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#c9933a")}>
                  {c.signupLabel}
                </Link>
                <Link href="/support" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#C9963E", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
                  {c.enquireLabel} <ArrowRight size={13} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
