"use client";
import React, { useEffect, useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function DoctorHelpline() {
  const [showHospitalCard, setShowHospitalCard] = useState(false);

  useEffect(() => {
    fetch("/api/settings/hospital-visibility")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.showSupportCard) setShowHospitalCard(true); })
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-primary rounded-2xl text-center relative overflow-hidden"
      style={{ marginBottom: "56px", padding: "64px 48px" }}
    >
      <div className="absolute inset-0 dot-grid opacity-10" />
      <div className="relative z-10">
        <p className="text-accent text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ marginBottom: "16px" }}>Get in touch</p>
        <h2 className="font-display font-bold text-white leading-snug" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", marginBottom: "16px" }}>
          Speak to our team.
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: "440px", margin: "0 auto 36px", fontSize: "15px", lineHeight: "1.75" }}>
          Available for dosage guidance, product queries, and wholesale or clinic partnership enquiries.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="tel:+916307922085" className="btn-primary btn-gold text-[14px] px-7 py-3" aria-label="Call us">
            <Phone size={15} strokeWidth={1.5} />
            +91 6307922085
          </a>
          <a href="https://wa.me/916307922085" target="_blank" rel="noopener noreferrer" className="btn-primary btn-outline-white text-[14px] px-7 py-3" aria-label="WhatsApp us">
            <MessageCircle size={15} strokeWidth={1.5} />
            WhatsApp Us
          </a>
        </div>

        {showHospitalCard && (
          <div style={{ marginTop: "36px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#c9933a", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "10px" }}>Hospital Appointments</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "16px" }}>Auberon Eye Care Centre — Kanpur</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+916307922085" className="btn-primary btn-outline-white text-[14px] px-7 py-3" aria-label="Call hospital">
                <Phone size={15} strokeWidth={1.5} />
                +91 6307922085
              </a>
              <a href="/hospital#appointment" className="btn-primary btn-gold text-[14px] px-7 py-3">
                Book Online
              </a>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
