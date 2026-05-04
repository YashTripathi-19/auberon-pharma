"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-primary overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(201,150,62,0.08),transparent)]" />

      {/* Very faint dot grid */}
      <div className="absolute inset-0 dot-grid opacity-20" />

      {/* Content */}
      <div className="relative z-10 container-premium text-center py-48 md:py-56 flex flex-col items-center">

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-accent text-[11px] font-semibold tracking-[0.2em] uppercase mb-6"
        >
          Auberon Pharmaceuticals · Chandra Pharma
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="font-display font-bold text-white text-[1.75rem] sm:text-[2.25rem] md:text-[3.5rem] leading-[1.1] tracking-tight max-w-4xl"
        >
          Ophthalmic care,
          <br />
          <span className="text-accent">crafted with precision.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-body text-white/60 text-[1rem] max-w-[480px] leading-[1.7] font-light mx-auto"
          style={{ marginTop: "2rem" }}
        >
          Specialised eye drops and ophthalmic tablets — trusted by
          ophthalmologists, wholesalers, and patients across India since 2010.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center gap-4"
          style={{ marginTop: "2rem" }}
        >
          <Link href="/products" className="btn-primary btn-gold text-[15px] px-8 py-3.5">
            Explore Products
          </Link>
          <Link href="/support" className="btn-primary btn-outline-white text-[15px] px-8 py-3.5">
            Contact Us
          </Link>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-[1px] h-8 bg-gradient-to-b from-white/0 via-white/30 to-white/0"
        />
      </motion.div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[1]"
        style={{ height: "160px", background: "linear-gradient(to top, #ffffff 40%, rgba(255,255,255,0.5) 70%, transparent 100%)" }}
      />
    </section>
  );
}
