import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const details = [
  { icon: MapPin, label: "Address", value: "Kanpur, Uttar Pradesh, India" },
  { icon: Phone, label: "Phone", value: "+91 6307922085", href: "tel:+916307922085" },
  { icon: Mail, label: "Email", value: "auberon.pharma@gmail.com", href: "mailto:auberon.pharma@gmail.com" },
  { icon: Clock, label: "Hours", value: "Mon–Sat: 9:00 AM – 6:00 PM IST" },
];

export default function ContactInfo() {
  return (
    <div>
      <p className="font-display font-semibold text-primary" style={{ fontSize: "1.2rem", marginBottom: "28px" }}>Contact information</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {details.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ width: "40px", height: "40px", background: "#F5F5F7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={15} className="text-muted" />
              </div>
              <div style={{ paddingTop: "2px" }}>
                <p style={{ fontSize: "10px", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "4px" }}>{item.label}</p>
                {item.href ? (
                  <a href={item.href} style={{ fontSize: "14px", color: "var(--color-primary)", textDecoration: "none" }} className="hover:text-accent transition-colors">{item.value}</a>
                ) : (
                  <p style={{ fontSize: "14px", color: "var(--color-primary)" }}>{item.value}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "32px", borderRadius: "16px", overflow: "hidden", background: "#F5F5F7", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "44px", height: "44px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <MapPin size={18} className="text-accent" />
          </div>
          <p style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: 500, marginBottom: "4px" }}>Kanpur, Uttar Pradesh</p>
          <a href="https://maps.google.com/?q=Kanpur+Uttar+Pradesh+India" target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "var(--color-accent)", textDecoration: "none" }} className="hover:underline">
            Open in Maps →
          </a>
        </div>
      </div>
    </div>
  );
}
