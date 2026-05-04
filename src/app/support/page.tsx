import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DoctorHelpline from "@/components/support/DoctorHelpline";
import FaqAccordion from "@/components/support/FaqAccordion";
import ContactForm from "@/components/support/ContactForm";
import ContactInfo from "@/components/support/ContactInfo";
import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: 'Help & Support',
  description: 'Get help with your orders, products, account or prescription queries. Contact Auberon Pharmaceuticals support team or browse our FAQ.',
  path: '/support',
});

export default function SupportPage() {
  return (
    <>
      <Navbar />
      <main className="page-content">
        {/* Page Header */}
        <div className="container-premium" style={{ paddingTop: "2.5rem", paddingBottom: "0" }}>
          <div style={{ marginBottom: "48px", width: "100%", textAlign: "center" }}>
            <p className="section-label" style={{ display: "block", marginBottom: "12px" }}>Help Centre</p>
            <h1 className="section-title text-[2rem] md:text-[2.8rem]" style={{ marginBottom: "16px" }}>Support & Contact</h1>
            <p style={{ color: "var(--color-muted)", fontSize: "15px", lineHeight: "1.75", maxWidth: "520px", marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
              Our team is here to help — from dosage queries to order assistance.
            </p>
          </div>
        </div>

        <div className="container-premium" style={{ paddingBottom: "5rem" }}>
          {/* Doctor Helpline */}
          <DoctorHelpline />

          {/* FAQ */}
          <FaqAccordion />

          {/* Contact Section */}
          <div style={{ marginBottom: "0" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <p className="section-label" style={{ display: "block", marginBottom: "12px" }}>Get in Touch</p>
              <h2 className="section-title text-[2rem] md:text-[2.4rem]">Contact Us</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-black/[0.06]" style={{ padding: "40px" }}>
                <ContactForm />
              </div>
              <div className="bg-white rounded-2xl border border-black/[0.06]" style={{ padding: "40px" }}>
                <ContactInfo />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
