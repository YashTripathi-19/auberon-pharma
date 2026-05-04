"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "Who is Auberon Pharmaceuticals?", a: "Founded in 2010 by Anurag Ranjan Tripathi, Auberon Pharmaceuticals is a specialised ophthalmic company based in Kanpur. In 2021 we established Chandra Pharma as our dedicated manufacturing arm. We supply eye drops and ophthalmic tablets to wholesalers, ophthalmologists, and now directly to consumers." },
  { q: "What is Chandra Pharma?", a: "Chandra Pharma is the manufacturing division of Auberon Pharmaceuticals, established in 2021. It produces our full range of ophthalmic formulations under GMP-certified conditions, ensuring consistent quality across every batch." },
  { q: "What types of products do you offer?", a: "Our range includes antibiotic eye drops, anti-inflammatory eye drops, lubricating drops, and supportive oral tablets for eye health — all developed for clinical use and verified by practising ophthalmologists." },
  { q: "Can wholesalers and clinics place bulk orders?", a: "Absolutely. We supply directly to wholesalers and ophthalmology clinics. For bulk orders or partnership enquiries, reach out via our contact form or call us directly." },
  { q: "How do I place an order?", a: "Go to our Shop page, select the products you need, add them to your cart, fill in your delivery details, and submit. Our team will contact you within 24 hours to confirm." },
  { q: "What payment methods do you accept?", a: "Payment is collected during the confirmation call. We accept UPI, bank transfer, credit/debit cards, and cash on delivery for eligible locations." },
  { q: "How long does delivery take?", a: "Standard delivery takes 2–5 business days depending on your location. Products are packaged to maintain integrity during transit." },
  { q: "Which areas do you deliver to?", a: "We currently serve 20+ cities across India and are actively expanding. Contact us to check availability in your area." },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ marginBottom: "56px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <p className="section-label" style={{ display: "block", marginBottom: "12px" }}>FAQ</p>
        <h2 className="section-title text-[2rem] md:text-[2.4rem]">Frequently asked questions.</h2>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "8px" }}>
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between text-left hover:bg-[#F5F5F7] transition-colors"
              style={{ padding: "20px 28px" }}
              aria-expanded={open === i}
            >
              <span className="text-[15px] font-medium text-primary leading-snug" style={{ paddingRight: "16px" }}>{faq.q}</span>
              <ChevronDown
                size={16}
                className={cn("text-muted shrink-0 transition-transform duration-300", open === i && "rotate-180 text-accent")}
              />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div style={{ padding: "0 28px 24px", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                    <p className="text-muted leading-[1.85]" style={{ fontSize: "14px", paddingTop: "20px" }}>{faq.a}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
