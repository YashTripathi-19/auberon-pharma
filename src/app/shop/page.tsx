import type { Metadata } from "next";
import { getProducts, getAllCategories } from "@/lib/db";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ShopPageClient from "./ShopPageClient";
import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: 'Order Medicine Online',
  description: 'Order ophthalmic medicines online with fast delivery. Bulk ordering available for wholesalers and clinics with special pricing and denomination options.',
  path: '/shop',
});

export default function ShopPage() {
  const publicCategoryNames = getAllCategories()
    .filter((c) => c.isPublic && c.isActive)
    .map((c) => c.name);

  const products = getProducts().filter(
    (p) => p.isActive && publicCategoryNames.includes(p.category)
  );

  return (
    <>
      <Navbar />
      <main className="page-content">
        {/* Header */}
        <div className="container-premium" style={{ paddingTop: "2.5rem", paddingBottom: "0" }}>
          <div style={{ marginBottom: "48px", width: "100%", textAlign: "center" }}>
            <p className="section-label" style={{ display: "block", marginBottom: "12px" }}>Order</p>
            <h1 className="section-title text-[2rem] md:text-[2.8rem]" style={{ marginBottom: "16px" }}>Order Medicine</h1>
            <p style={{ color: "var(--color-muted)", fontSize: "15px", lineHeight: "1.75", maxWidth: "560px", marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
              Select your products, fill in delivery details, and our team will confirm your order within 24 hours.
            </p>
          </div>
        </div>

        <div className="container-premium" style={{ paddingBottom: "4rem" }}>
          <ShopPageClient products={products} />
        </div>
      </main>
      <Footer />
    </>
  );
}
