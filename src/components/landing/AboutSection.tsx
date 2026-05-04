"use client";
import React from "react";
import { motion } from "framer-motion";

const timeline = [
  { year: "2010", text: "Auberon Pharmaceuticals founded by Anurag Ranjan Tripathi in Kanpur" },
  { year: "2015", text: "Expanded ophthalmic range — supplying directly to hospitals and clinics" },
  { year: "2021", text: "Chandra Pharma established as dedicated manufacturing arm" },
  { year: "2024", text: "Direct-to-consumer channel launched online" },
];

export default function AboutSection() {
  return (
    <section
      className="bg-[#F5F5F7]"
      style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "6rem 0" }}
    >
      <div className="container-premium w-full">

        {/* Label + Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "4rem" }}
        >
          <p className="section-label" style={{ marginBottom: "1rem" }}>Our Story</p>
          <h2 className="section-title" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            Founded on a vision<br />of better eye care.
          </h2>
          <p style={{ marginTop: "1.25rem", color: "#6E6E73", fontSize: "15px", lineHeight: "1.8", maxWidth: "38rem", marginLeft: "auto", marginRight: "auto" }}>
            What began as a distribution venture in 2010 has grown into a vertically integrated
            ophthalmic company — from manufacturing to direct patient delivery.
          </p>
        </motion.div>

        {/* Two column — story + timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "4rem", alignItems: "start" }}>

          {/* Story paragraphs */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <p style={{ fontSize: "15px", color: "#6E6E73", lineHeight: "1.9" }}>
              Auberon Pharmaceuticals was founded in 2010 by{" "}
              <span style={{ color: "#0B1F3A", fontWeight: 600 }}>Anurag Ranjan Tripathi</span>{" "}
              with a singular focus — making high-quality ophthalmic medicines accessible to
              doctors and patients across India. Starting as a distribution venture, it quickly
              became a trusted name among ophthalmologists and eye care clinics.
            </p>
            <p style={{ fontSize: "15px", color: "#6E6E73", lineHeight: "1.9" }}>
              In 2021, the company extended its scope with the establishment of{" "}
              <span style={{ color: "#0B1F3A", fontWeight: 600 }}>Chandra Pharma</span>, a
              dedicated manufacturing arm producing the full range of Auberon's ophthalmic
              formulations — from antibiotic and anti-inflammatory eye drops to supportive
              oral tablets.
            </p>
            <p style={{ fontSize: "15px", color: "#6E6E73", lineHeight: "1.9" }}>
              Today we supply directly to wholesalers, hospitals, and ophthalmology clinics —
              and are now extending our reach to individual consumers.
            </p>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ display: "flex", flexDirection: "column", gap: "0" }}
          >
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{ display: "flex", gap: "1.5rem", paddingBottom: i < timeline.length - 1 ? "2.5rem" : "0", position: "relative" }}
              >
                {/* Vertical line */}
                {i < timeline.length - 1 && (
                  <div style={{ position: "absolute", left: "15px", top: "32px", bottom: 0, width: "1px", background: "rgba(0,0,0,0.08)" }} />
                )}
                {/* Dot */}
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#0B1F3A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C9963E" }} />
                </div>
                <div style={{ paddingTop: "4px" }}>
                  <p style={{ color: "#C9963E", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", marginBottom: "6px" }}>{item.year}</p>
                  <p style={{ color: "#0B1F3A", fontSize: "14px", lineHeight: "1.7" }}>{item.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
