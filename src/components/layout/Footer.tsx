"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const [showHospital, setShowHospital] = useState(false);

  useEffect(() => {
    fetch("/api/settings/hospital-visibility")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.showInNav) setShowHospital(true); })
      .catch(() => {});
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    ...(showHospital ? [{ href: "/hospital", label: "Hospital Wing" }] : []),
    { href: "/shop", label: "Order Medicine" },
    { href: "/support", label: "Support & FAQ" },
    { href: "/admin/login", label: "Admin Portal" },
  ];

  return (
    <footer style={{ background: "#0B1F3A" }}>
      <div style={{ maxWidth: "1080px", margin: "0 auto", paddingLeft: "2rem", paddingRight: "2rem", paddingTop: "6rem", paddingBottom: "4rem" }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ paddingBottom: "4rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {/* Brand */}
          <div>
            <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "white", letterSpacing: "0.04em", marginBottom: "6px" }}>Auberon Pharmaceuticals</p>
            <p style={{ fontSize: "8px", color: "#C9963E", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginBottom: "1.5rem" }}>Chandra Pharma</p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: "1.85", maxWidth: "280px" }}>
              Specialised ophthalmic formulations manufactured by Chandra Pharma. Trusted by ophthalmologists, wholesalers, and patients across India since 2010.
            </p>
          </div>
          {/* Navigate */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "1.5rem" }}>Navigate</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{link.label}</Link>
              ))}
            </div>
          </div>
          {/* Contact */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "1.5rem" }}>Contact</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <MapPin size={12} style={{ color: "rgba(255,255,255,0.3)", marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: "1.6" }}>Kanpur, Uttar Pradesh, India</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={12} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                <a href="tel:+916307922085" style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>+91 6307922085</a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Mail size={12} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                <a href="mailto:auberon.pharma@gmail.com" style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>auberon.pharma@gmail.com</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ paddingTop: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()} Auberon Pharmaceuticals. All rights reserved.</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/support" style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>Privacy Policy</Link>
            <Link href="/support" style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
