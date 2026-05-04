"use client";
import React, { useState } from "react";
import { useToastStore } from "@/store/toastStore";
import { Loader2, Send } from "lucide-react";

export default function ContactForm() {
  const addToast = useToastStore((s) => s.addToast);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.message.trim() || form.message.trim().length < 10) e.message = "Message must be at least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      addToast("success", "Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
    } catch {
      addToast("error", "Failed to send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const label = "block text-[11px] font-semibold text-muted uppercase tracking-[0.1em]";
  const errCls = "text-[11px] text-red-500 mt-1.5";

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <p className="font-display font-semibold text-primary" style={{ fontSize: "1.2rem", marginBottom: "4px" }}>Send us a message</p>

      <div>
        <label className={label} style={{ display: "block", marginBottom: "8px" }}>Name <span className="text-red-400">*</span></label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-premium" placeholder="Your name" aria-label="Name" />
        {errors.name && <p className={errCls}>{errors.name}</p>}
      </div>

      <div>
        <label className={label} style={{ display: "block", marginBottom: "8px" }}>Email <span className="text-red-400">*</span></label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-premium" placeholder="you@example.com" aria-label="Email" />
        {errors.email && <p className={errCls}>{errors.email}</p>}
      </div>

      <div>
        <label className={label} style={{ display: "block", marginBottom: "8px" }}>Phone</label>
        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-premium" placeholder="+91 98765 43210" aria-label="Phone" />
        <p style={{ fontSize: "11px", color: "var(--color-muted)", marginTop: "6px" }}>Optional — we&apos;ll respond via email</p>
      </div>

      <div>
        <label className={label} style={{ display: "block", marginBottom: "8px" }}>Subject</label>
        <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-premium" aria-label="Subject">
          <option>General Inquiry</option>
          <option>Product Information</option>
          <option>Order Support</option>
          <option>Dosage Guidance</option>
          <option>Partnership / Distribution</option>
          <option>Complaint</option>
        </select>
      </div>

      <div>
        <label className={label} style={{ display: "block", marginBottom: "8px" }}>Message <span className="text-red-400">*</span></label>
        <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-premium" placeholder="How can we help?" aria-label="Message" />
        {errors.message && <p className={errCls}>{errors.message}</p>}
      </div>

      <button type="submit" disabled={submitting} className="w-full btn-primary btn-gold disabled:opacity-50 flex items-center justify-center gap-2" style={{ fontSize: "14px", padding: "14px 20px" }} aria-label="Send message">
        {submitting ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : <><Send size={14} /> Send Message</>}
      </button>
    </form>
  );
}
