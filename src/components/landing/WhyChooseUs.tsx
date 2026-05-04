"use client";
import React from "react";
import { motion } from "framer-motion";
import { Eye, ShieldCheck, Truck, PhoneCall } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Ophthalmic specialists",
    description: "Every formulation is developed specifically for ocular care — verified by practising ophthalmologists for clinical precision.",
  },
  {
    icon: ShieldCheck,
    title: "GMP-certified manufacturing",
    description: "Manufactured by Chandra Pharma under strict GMP standards. Every batch is independently tested before it reaches you.",
  },
  {
    icon: Truck,
    title: "Direct supply chain",
    description: "We supply directly to wholesalers, hospitals, clinics, and consumers — cutting intermediaries and ensuring product integrity.",
  },
  {
    icon: PhoneCall,
    title: "Dedicated support",
    description: "Our team assists healthcare professionals with product queries, dosage guidance, and bulk procurement enquiries.",
  },
];

export default function WhyChooseUs() {
  return (
    <section
      className="bg-white"
      style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "6rem 0" }}
    >
      <div className="container-premium w-full">

        {/* Header block */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "4.5rem" }}
        >
          <p className="section-label" style={{ marginBottom: "1rem" }}>Why Auberon</p>
          <h2 className="section-title" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            Built differently.<br />For eye care.
          </h2>
        </motion.div>

        {/* Feature grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
          style={{
            gap: "1px",
            background: "rgba(0,0,0,0.06)",
            borderRadius: "1.25rem",
            overflow: "hidden",
          }}
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group"
                style={{ background: "white", padding: "3rem 2.5rem", transition: "background 0.3s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F5F7")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                {/* Icon */}
                <div
                  style={{
                    width: "48px", height: "48px", borderRadius: "14px",
                    background: "rgba(11,31,58,0.05)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    marginBottom: "1.75rem",
                  }}
                >
                  <Icon size={20} strokeWidth={1.5} style={{ color: "#0B1F3A" }} />
                </div>

                {/* Title */}
                <h3
                  className="font-display"
                  style={{ fontSize: "1.1rem", fontWeight: 600, color: "#0B1F3A", marginBottom: "1rem", lineHeight: 1.3 }}
                >
                  {f.title}
                </h3>

                {/* Description */}
                <p style={{ fontSize: "13px", color: "#6E6E73", lineHeight: "1.8" }}>
                  {f.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
