import { Suspense } from "react";
import CheckoutPageClient from "./CheckoutPageClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: 'Checkout',
  description: 'Complete your medicine order securely.',
  path: '/checkout',
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="page-content" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div className="container-premium">
          <div style={{ marginBottom: "40px" }}>
            <p className="section-label" style={{ display: "block", marginBottom: "8px" }}>Checkout</p>
            <h1 className="section-title" style={{ fontSize: "2.2rem" }}>Complete Your Order</h1>
          </div>
          <Suspense fallback={<div style={{ textAlign: "center", padding: "80px", color: "#6E6E73" }}>Loading checkout…</div>}>
            <CheckoutPageClient />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
