"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToastStore, Toast as ToastType } from "@/store/toastStore";

const DURATION = 5000;

const config = {
  success: { Icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  error:   { Icon: AlertCircle, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  info:    { Icon: Info,        color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
};

function ToastItem({ toast, fromBottom, onRemove }: {
  toast: ToastType;
  fromBottom: number;
  onRemove: () => void;
}) {
  const { Icon, color, bg } = config[toast.type];
  const isNewest = fromBottom === 0;
  const opacity = Math.max(0, 1 - fromBottom * 0.22);
  const scale = 1 - fromBottom * 0.03;

  return (
    <motion.div
      layout
      initial={{ x: 100, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity, scale }}
      exit={{ x: 100, opacity: 0, scale: 0.88 }}
      transition={{ type: "spring", damping: 24, stiffness: 300 }}
      style={{ transformOrigin: "bottom right", width: "100%" }}
    >
      <div style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid rgba(0,0,0,0.07)",
        overflow: "hidden",
        boxShadow: isNewest
          ? "0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.05)"
          : "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 14px 11px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "9px",
            background: bg, display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
          }}>
            <Icon size={15} strokeWidth={2} style={{ color }} />
          </div>
          <p style={{ fontSize: "13px", color: "#0B1F3A", flex: 1, lineHeight: 1.5, fontWeight: 500 }}>
            {toast.message}
          </p>
          <button
            onClick={onRemove}
            style={{
              width: "22px", height: "22px", borderRadius: "7px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "transparent", border: "none", cursor: "pointer",
              flexShrink: 0, color: "#6E6E73",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F5F7")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label="Dismiss"
          >
            <X size={11} />
          </button>
        </div>
        {isNewest && (
          <div style={{ height: "3px", background: "rgba(0,0,0,0.05)" }}>
            <div
              key={toast.id}
              style={{
                height: "100%",
                background: color,
                animation: `toast-drain ${DURATION}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Toast() {
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      <style>{`@keyframes toast-drain { from { width: 100%; } to { width: 0%; } }`}</style>
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "340px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column-reverse",
          gap: "8px",
          alignItems: "stretch",
        }}
      >
        <AnimatePresence mode="sync" initial={false}>
          {toasts.map((toast, index) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              fromBottom={toasts.length - 1 - index}
              onRemove={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
