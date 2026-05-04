import type { Metadata } from "next";
import { getProducts, getAllCategories } from "@/lib/db";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductsPageClient from "./ProductsPageClient";
import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: 'Ophthalmic Products',
  description: 'Browse our complete range of specialist ophthalmic medicines — eye drops, ointments, tablets and more. Rx and OTC products for patients, clinics and wholesalers.',
  path: '/products',
});

export default function ProductsPage() {
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
        {/* Header — own centered block, outside the sidebar layout */}
        <div className="container-premium" style={{ paddingTop: "2.5rem", paddingBottom: "0" }}>
          <div style={{ marginBottom: "48px", width: "100%", textAlign: "center" }}>
            <p className="section-label" style={{ display: "block", marginBottom: "12px" }}>Our Range</p>
            <h1 className="section-title text-[2rem] md:text-[2.8rem]" style={{ marginBottom: "16px" }}>Product Catalogue</h1>
            <p style={{ color: "var(--color-muted)", fontSize: "15px", lineHeight: "1.75", maxWidth: "600px", marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
              Ophthalmic formulations developed for clinical precision — trusted by eye care professionals nationwide.
            </p>
          </div>
        </div>

        <div className="container-premium" style={{ paddingBottom: "4rem" }}>
          <ProductsPageClient products={products} />
        </div>
      </main>
      <Footer />
    </>
  );
}
