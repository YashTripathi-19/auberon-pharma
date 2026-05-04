"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
      <div style={{ width: "64px", height: "64px", background: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
        <svg style={{ width: "28px", height: "28px", color: "#ef4444" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "10px" }}>
        Dashboard Error
      </h2>
      <p style={{ fontSize: "14px", color: "#6E6E73", marginBottom: "32px", lineHeight: 1.6 }}>
        Something went wrong loading the admin panel.
      </p>
      <button
        onClick={reset}
        style={{
          background: "#0B1F3A", color: "white",
          padding: "12px 28px", borderRadius: "999px",
          fontSize: "14px", fontWeight: 500,
          border: "none", cursor: "pointer",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#132d4f")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#0B1F3A")}
      >
        Try Again
      </button>
    </div>
  );
}
