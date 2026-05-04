"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Eye, Shield, Users, Clock, MapPin, Phone, Mail, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface HospitalData {
  name: string; tagline: string; address: string; phone: string; email: string; hours: string; about: string;
  features: { icon: string; title: string; description: string }[];
  services: { id: string; name: string; description: string; duration: string; price: string; isAvailable: boolean }[];
  doctors: { id: string; name: string; designation: string; specialisation: string; experience: string; qualifications: string; available: boolean }[];
  stats: { value: string; label: string }[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  eye: <Eye size={22} strokeWidth={1.5} />,
  shield: <Shield size={22} strokeWidth={1.5} />,
  users: <Users size={22} strokeWidth={1.5} />,
  clock: <Clock size={22} strokeWidth={1.5} />,
};

const TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

function initials(name: string) {
  return name.split(" ").filter((_, i) => i < 2).map((n) => n[0]).join("").toUpperCase();
}

export default function HospitalPageClient({ data }: { data: HospitalData }) {
  const appointmentRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [selectedService, setSelectedService] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", doctorId: "", doctorName: "", preferredDate: "", preferredTime: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.ok ? r.json() : null).then((user) => {
      if (!user) return;
      setForm((f) => ({ ...f, name: user.name || "", email: user.email || "", phone: user.phone || "" }));
    }).catch(() => {});
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBookService = (service: { id: string; name: string }) => {
    setSelectedService(service.name);
    setSelectedServiceId(service.id);
    setTimeout(() => scrollTo(appointmentRef), 100);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!selectedService) e.service = "Please select a service";
    if (!form.preferredDate) e.preferredDate = "Required";
    if (!form.preferredTime) e.preferredTime = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/hospital/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, service: selectedService, serviceId: selectedServiceId || "general", doctorId: form.doctorId || null, doctorName: form.doctorName || null }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setErrors({ submit: "Failed to submit. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const lbl = { display: "block", fontSize: "11px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "8px" };
  const err = { fontSize: "11px", color: "#dc2626", marginTop: "4px" };
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      {/* Section 1 — Hero */}
      <section style={{ background: "#1a2744", paddingTop: "calc(var(--banner-h, 0px) + 120px)", paddingBottom: "100px" }}>
        <div className="container-premium" style={{ textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#c9933a", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "24px" }}>Auberon Eye Care Centre</p>
            <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, color: "white", lineHeight: 1.15, maxWidth: "700px", margin: "0 auto", marginBottom: "20px" }}>
              Precision eye care, crafted with expertise.
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px", lineHeight: 1.75, maxWidth: "520px", margin: "0 auto", marginBottom: "48px" }}>
              From routine consultations to advanced surgical procedures — your vision is in expert hands.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => scrollTo(appointmentRef)} className="btn-primary btn-gold" style={{ fontSize: "14px", padding: "13px 32px" }}>Book a Consultation</button>
              <button onClick={() => scrollTo(servicesRef)} className="btn-primary btn-outline-white" style={{ fontSize: "14px", padding: "13px 32px" }}>Our Services</button>
            </div>
          </motion.div>

          {/* Stats bar */}
          <div style={{ display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap", marginTop: "64px", paddingTop: "48px", paddingBottom: "16px", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            {data.stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2.2rem", fontWeight: 700, color: "#c9933a", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2 — About */}
      <section style={{ background: "#F5F5F7", padding: "80px 0" }}>
        <div className="container-premium">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p className="section-label" style={{ display: "block", marginBottom: "16px" }}>Our Story</p>
              <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.15, marginBottom: "20px" }}>
                Built on a foundation of precision.
              </h2>
              <p style={{ fontSize: "15px", color: "#6E6E73", lineHeight: 1.85, marginBottom: "48px" }}>{data.about}</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  style={{ background: "white", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", padding: "24px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(201,147,62,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9933a", marginBottom: "14px" }}>
                    {ICON_MAP[f.icon] || <Eye size={22} strokeWidth={1.5} />}
                  </div>
                  <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.05rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "8px" }}>{f.title}</p>
                  <p style={{ fontSize: "13px", color: "#6E6E73", lineHeight: 1.7 }}>{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Services */}
      <section ref={servicesRef} style={{ background: "white", padding: "80px 0" }}>
        <div className="container-premium">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p className="section-label" style={{ display: "block", marginBottom: "16px" }}>Our Services</p>
            <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#0B1F3A", marginBottom: "20px" }}>What we offer.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                style={{ background: "#F9F9FB", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "28px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h3 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#0B1F3A" }}>{s.name}</h3>
                  {s.isAvailable && <span style={{ fontSize: "10px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#f0fdf4", color: "#16a34a", flexShrink: 0, marginLeft: "8px" }}>Available</span>}
                </div>
                <p style={{ fontSize: "13px", color: "#6E6E73", lineHeight: 1.7, flex: 1, marginBottom: "16px" }}>{s.description}</p>
                <p style={{ fontSize: "12px", color: "#c9933a", marginBottom: "4px" }}>⏱ {s.duration}</p>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#0B1F3A", marginBottom: "16px" }}>{s.price}</p>
                <button onClick={() => handleBookService(s)}
                  style={{ fontSize: "13px", fontWeight: 600, padding: "9px 20px", borderRadius: "999px", border: "1.5px solid #c9933a", background: "transparent", color: "#c9933a", cursor: "pointer", transition: "all 0.2s" }}
                  className="hover:bg-accent hover:text-white">
                  Book This Service
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Doctors */}
      <section style={{ background: "#1a2744", padding: "80px 0" }}>
        <div className="container-premium">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#c9933a", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "16px" }}>Our Team</p>
            <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "white", marginBottom: "20px" }}>Meet our specialists.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.doctors.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ background: "rgba(255,255,255,0.06)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", padding: "32px", textAlign: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(201,147,62,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "1.2rem", fontWeight: 700, color: "#c9933a", fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                  {initials(d.name)}
                </div>
                <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: "4px" }}>{d.name}</p>
                <p style={{ fontSize: "12px", color: "#c9933a", fontWeight: 500, marginBottom: "8px" }}>{d.designation}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "12px" }}>{d.specialisation}</p>
                <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 12px", borderRadius: "999px", background: "rgba(201,147,62,0.2)", color: "#c9933a" }}>{d.experience}</span>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "10px" }}>{d.qualifications}</p>
                {d.available && (
                  <p style={{ fontSize: "11px", color: "#4ade80", marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                    Available for consultations
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — Appointment Booking */}
      <section ref={appointmentRef} id="appointment" style={{ background: "#F5F5F7", padding: "80px 0" }}>
        <div className="container-premium">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p className="section-label" style={{ display: "block", marginBottom: "16px" }}>Book an Appointment</p>
            <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#0B1F3A", marginBottom: "20px" }}>Schedule your visit.</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3">
              <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "36px" }}>
                {submitted ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <CheckCircle size={48} style={{ color: "#16a34a", margin: "0 auto 16px" }} />
                    <h3 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "12px" }}>Appointment Requested!</h3>
                    <p style={{ fontSize: "14px", color: "#6E6E73", lineHeight: 1.7 }}>
                      We will confirm your appointment within 2 hours via email or phone. Our team will reach out to <strong>{form.email}</strong>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label style={lbl}>Full Name *</label>
                        <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-premium" placeholder="Your name" />
                        {errors.name && <p style={err}>{errors.name}</p>}
                      </div>
                      <div>
                        <label style={lbl}>Phone *</label>
                        <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input-premium" placeholder="+91 98765 43210" />
                        {errors.phone && <p style={err}>{errors.phone}</p>}
                      </div>
                    </div>
                    <div>
                      <label style={lbl}>Email *</label>
                      <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input-premium" placeholder="you@example.com" />
                      {errors.email && <p style={err}>{errors.email}</p>}
                    </div>
                    <div>
                      <label style={lbl}>Service *</label>
                      <select value={selectedServiceId} onChange={(e) => { const s = data.services.find((x) => x.id === e.target.value); if (s) { setSelectedService(s.name); setSelectedServiceId(s.id); } }} className="input-premium">
                        <option value="">Select a service</option>
                        {data.services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      {errors.service && <p style={err}>{errors.service}</p>}
                    </div>
                    <div>
                      <label style={lbl}>Preferred Doctor</label>
                      <select value={form.doctorId} onChange={(e) => { const d = data.doctors.find((x) => x.id === e.target.value); setForm((f) => ({ ...f, doctorId: e.target.value, doctorName: d?.name || "" })); }} className="input-premium">
                        <option value="">No preference</option>
                        {data.doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label style={lbl}>Preferred Date *</label>
                        <input type="date" min={today} value={form.preferredDate} onChange={(e) => setForm((f) => ({ ...f, preferredDate: e.target.value }))} className="input-premium" />
                        {errors.preferredDate && <p style={err}>{errors.preferredDate}</p>}
                      </div>
                      <div>
                        <label style={lbl}>Preferred Time *</label>
                        <select value={form.preferredTime} onChange={(e) => setForm((f) => ({ ...f, preferredTime: e.target.value }))} className="input-premium">
                          <option value="">Select time</option>
                          {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {errors.preferredTime && <p style={err}>{errors.preferredTime}</p>}
                      </div>
                    </div>
                    <div>
                      <label style={lbl}>Notes / Symptoms</label>
                      <textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="input-premium" placeholder="Describe your symptoms or any relevant information" />
                    </div>
                    {errors.submit && <p style={{ ...err, fontSize: "13px" }}>{errors.submit}</p>}
                    <button type="submit" disabled={submitting} className="btn-primary btn-gold" style={{ fontSize: "14px", padding: "14px 20px", opacity: submitting ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      {submitting ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : "Request Appointment"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact info */}
            <div className="lg:col-span-2">
              <div style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", padding: "36px" }}>
                <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "24px" }}>Contact Information</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {[
                    { icon: <MapPin size={16} strokeWidth={1.5} />, label: "Address", value: data.address },
                    { icon: <Phone size={16} strokeWidth={1.5} />, label: "Phone", value: data.phone },
                    { icon: <Mail size={16} strokeWidth={1.5} />, label: "Email", value: data.email },
                    { icon: <Clock size={16} strokeWidth={1.5} />, label: "Hours", value: data.hours },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(201,147,62,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9933a", flexShrink: 0 }}>
                        {item.icon}
                      </div>
                      <div>
                        <p style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>{item.label}</p>
                        <p style={{ fontSize: "13px", color: "#0B1F3A" }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "24px", background: "#F5F5F7", borderRadius: "12px", height: "140px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Kanpur, Uttar Pradesh, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
