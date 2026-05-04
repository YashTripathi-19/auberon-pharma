"use client";
import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({ isOpen, onClose, children, title, size = "md" }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={`relative ${sizes[size]} w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}
          >
            {title ? (
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between border-b border-black/[0.06]"
                style={{ padding: "24px 32px" }}>
                <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "#0B1F3A" }}>{title}</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-[#F5F5F7] transition-colors" aria-label="Close">
                  <X size={18} className="text-muted" />
                </button>
              </div>
            ) : (
              <button onClick={onClose} className="absolute top-5 right-5 z-10 p-2 rounded-full hover:bg-[#F5F5F7] transition-colors" aria-label="Close">
                <X size={18} className="text-muted" />
              </button>
            )}
            <div style={{ padding: "32px" }}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
