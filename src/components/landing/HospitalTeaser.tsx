"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const STATS = [
  { value: "5,000+", label: "Patients Treated" },
  { value: "15+", label: "Years of Expertise" },
  { value: "3", label: "Specialist Doctors" },
  { value: "98%", label: "Patient Satisfaction" },
];

export default function HospitalTeaser() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/settings/hospital-visibility")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.showHomeTeaser) setVisible(true); })
      .catch(() => {});
  }, []);

  if (!visible) return null;

  return (
    <section style={{ background: "#1a2744", padding: "80px 0" }}>
      <div className="container-premium">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: "center" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#c9933a", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "16px" }}>Coming Soon</p>
          <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: "16px" }}>
            Auberon Eye Care Centre
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", lineHeight: 1.75, maxWidth: "520px", margin: "0 auto 36px" }}>
            Our clinical arm is opening soon in Kanpur. World-class ophthalmic care, backed by 15 years of pharmaceutical precision.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap", marginBottom: "40px" }}>
            {STATS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#c9933a", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
              </motion.div>
            ))}
          </div>

          <Link href="/hospital" className="btn-primary btn-gold" style={{ fontSize: "14px", padding: "13px 32px" }}>
            Learn More &amp; Book
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
