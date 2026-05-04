"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import LiveEyeScanner from "@/components/eye-tests/LiveEyeScanner"

export default function EyeScanPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: "#f8f7f4", minHeight: "100vh", paddingTop: 80 }}>
        {/* Page header */}
        <div style={{
          background: "#1a2744",
          padding: "60px 24px",
          textAlign: "center",
          marginBottom: 48
        }}>
          <p style={{
            color: "#c9933a",
            fontWeight: 700,
            letterSpacing: "0.15em",
            fontSize: 12,
            textTransform: "uppercase",
            marginBottom: 16
          }}>
            EYE HEALTH TOOLS
          </p>
          <h1 style={{
            color: "white",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 700,
            marginBottom: 16,
            lineHeight: 1.2
          }}>
            Live Eye Scanner
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 16,
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.7
          }}>
            Our AI-powered preliminary screening tool analyses your eye for signs
            of conjunctivitis and cataract using your device camera.
          </p>
        </div>

        {/* Scanner component */}
        <div style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 24px 80px"
        }}>
          <LiveEyeScanner />
        </div>
      </main>
      <Footer />
    </>
  )
}
