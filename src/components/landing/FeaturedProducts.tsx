"use client";
import React from "react";
import { motion } from "framer-motion";
import { Product } from "@/types/product";
import ProductCard from "@/components/products/ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="bg-[#F5F5F7]" style={{ minHeight: "100vh", paddingTop: "5rem", paddingBottom: "4rem", display: "flex", alignItems: "center" }}>
      <div className="container-premium w-full">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
          style={{ marginBottom: "3rem" }}
        >
          {/* Part 1 — label */}
          <p className="section-label" style={{ marginBottom: "1rem" }}>Our Range</p>

          {/* Part 2 — heading */}
          <h2 className="section-title text-[2rem] md:text-[2.8rem]">
            Featured products.
          </h2>

          {/* Part 3 — subtext */}
          <p style={{ textAlign: "center", marginTop: "1.25rem", color: "#6E6E73", fontSize: "15px", lineHeight: "1.75", maxWidth: "36rem", marginLeft: "auto", marginRight: "auto" }}>
            Ophthalmic formulations developed for clinical precision — trusted by eye care professionals nationwide.
          </p>
        </motion.div>

        {/* Part 4 — cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 3).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
          style={{ marginTop: "3rem" }}
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-accent text-[14px] font-medium hover:gap-3 transition-all duration-200 group"
          >
            View all products
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Section divider */}
        <div style={{ marginTop: "4rem", height: "1px", background: "linear-gradient(to right, transparent, rgba(0,0,0,0.08), transparent)" }} />
      </div>
    </section>
  );
}
