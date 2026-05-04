"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PLATE_COMPONENTS } from "@/components/eye-tests/IshiharaPlates";
import { TEST_PLATES, TestResult } from "@/lib/colourBlindnessTest";
import { Loader2 } from "lucide-react";

type Step = "disclaimer" | "test" | "results";

const RESULT_COLORS: Record<string, string> = {
  "Normal Vision": "#16a34a",
  "Red-Green Deficiency": "#f59e0b",
  "Blue-Yellow Deficiency": "#f59e0b",
  "Mild Colour Deficiency": "#f59e0b",
  "Total Colour Blindness": "#dc2626",
};

export default function ColourBlindnessPage() {
  const [step, setStep] = useState<Step>("disclaimer");
  const [currentPlate, setCurrentPlate] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);

  const plate = TEST_PLATES[currentPlate];
  const PlateComponent = PLATE_COMPONENTS[currentPlate];
  const isLast = currentPlate === TEST_PLATES.length - 1;
  const progress = ((currentPlate + 1) / TEST_PLATES.length) * 100;

  const handleNext = async () => {
    if (!selected) return;
    const newAnswers = { ...answers, [plate.id]: selected };
    setAnswers(newAnswers);

    if (isLast) {
      setSubmitting(true);
      try {
        const res = await fetch("/api/eye-tests/colour-blindness", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers }),
        });
        const data = await res.json();
        setResult(data);
        setStep("results");
      } catch {
        // Fallback: calculate client-side
        const { calculateResult } = await import("@/lib/colourBlindnessTest");
        setResult(calculateResult(newAnswers));
        setStep("results");
      } finally {
        setSubmitting(false);
      }
    } else {
      setDirection(1);
      setCurrentPlate((p) => p + 1);
      setSelected(null);
    }
  };

  const handleReset = () => {
    setStep("disclaimer");
    setCurrentPlate(0);
    setAnswers({});
    setSelected(null);
    setResult(null);
  };

  const resultColor = result ? (RESULT_COLORS[result.type] || "#f59e0b") : "#f59e0b";
  const severityColors: Record<string, string> = {
    None: "#16a34a", Mild: "#f59e0b", Moderate: "#f97316", Severe: "#dc2626",
  };

  return (
    <>
      <Navbar />
      <main className="page-content" style={{ background: "#f8f7f4", minHeight: "100vh" }}>

        {/* Disclaimer */}
        {step === "disclaimer" && (
          <section style={{ background: "#1a2744", paddingTop: "80px", paddingBottom: "80px" }}>
            <div className="container-premium" style={{ maxWidth: "640px", textAlign: "center" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#c9933a", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "16px" }}>Eye Health Check</p>
              <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: "16px" }}>
                Colour Blindness Test
              </h1>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", lineHeight: 1.75, marginBottom: "36px" }}>
                This is a preliminary screening tool based on Ishihara-style plates. It is not a medical diagnosis.
              </p>

              {/* Disclaimer box */}
              <div style={{ background: "#fdf6e3", border: "1.5px solid #c9933a", borderRadius: "12px", padding: "24px", textAlign: "left", marginBottom: "36px" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#92400e", marginBottom: "12px" }}>Please read before starting:</p>
                {[
                  "This test is for screening purposes only",
                  "Results may be affected by screen brightness and colour calibration",
                  "This is NOT a substitute for professional medical evaluation",
                  "If you suspect colour vision issues, please consult an ophthalmologist",
                ].map((item, i) => (
                  <p key={i} style={{ fontSize: "13px", color: "#92400e", lineHeight: 1.7 }}>• {item}</p>
                ))}
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => setStep("test")} className="btn-primary btn-gold" style={{ fontSize: "14px", padding: "13px 28px" }}>
                  I Understand — Start Test
                </button>
                <Link href="/" className="btn-primary btn-outline-white" style={{ fontSize: "14px", padding: "13px 28px" }}>
                  Back to Home
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Test plates */}
        {step === "test" && (
          <div style={{ paddingTop: "48px", paddingBottom: "64px" }}>
            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 24px" }}>
              {/* Progress */}
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#6E6E73" }}>Plate {currentPlate + 1} of {TEST_PLATES.length}</span>
                  <span style={{ fontSize: "13px", color: "#9CA3AF" }}>{Math.round(progress)}% complete</span>
                </div>
                <div style={{ height: "4px", background: "#e5e7eb", borderRadius: "2px", overflow: "hidden" }}>
                  <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
                    style={{ height: "100%", background: "#c9933a", borderRadius: "2px" }} />
                </div>
              </div>

              {/* Plate card */}
              <div style={{ background: "white", borderRadius: "16px", padding: "40px", textAlign: "center", marginBottom: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <AnimatePresence mode="wait">
                  <motion.div key={currentPlate}
                    initial={{ opacity: 0, x: direction * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -direction * 40 }}
                    transition={{ duration: 0.3 }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
                      <PlateComponent width={280} height={280} />
                    </div>
                    <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.2rem", fontWeight: 600, color: "#0B1F3A", marginBottom: "24px" }}>
                      {plate.question}
                    </p>

                    {/* Options 2x2 grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {plate.options.map((opt) => (
                        <button key={opt} onClick={() => setSelected(opt)}
                          style={{
                            padding: "14px 24px", borderRadius: "8px", fontSize: "1rem", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                            background: selected === opt ? "#c9933a" : "white",
                            color: selected === opt ? "white" : "#0B1F3A",
                            border: selected === opt ? "2px solid #c9933a" : "2px solid #e5e7eb",
                          }}
                          onMouseEnter={(e) => { if (selected !== opt) { e.currentTarget.style.borderColor = "#c9933a"; e.currentTarget.style.color = "#c9933a"; } }}
                          onMouseLeave={(e) => { if (selected !== opt) { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#0B1F3A"; } }}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next button */}
              <button onClick={handleNext} disabled={!selected || submitting}
                className="btn-primary btn-gold"
                style={{ width: "100%", fontSize: "14px", padding: "14px 20px", opacity: !selected || submitting ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {submitting ? <><Loader2 size={15} className="animate-spin" /> Processing…</> : isLast ? "See Results" : "Next →"}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {step === "results" && result && (
          <div style={{ paddingTop: "48px", paddingBottom: "64px" }}>
            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 24px" }}>
              <div style={{ background: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>

                {/* Result type */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px" }}>Your Result</p>
                  <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: resultColor, marginBottom: "12px" }}>
                    {result.type}
                  </h2>
                  <span style={{ fontSize: "12px", fontWeight: 700, padding: "4px 14px", borderRadius: "999px", background: severityColors[result.severity] + "20", color: severityColors[result.severity] }}>
                    {result.severity} Severity
                  </span>
                </div>

                {/* Score */}
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                  <p style={{ fontSize: "15px", color: "#6E6E73", marginBottom: "12px" }}>
                    You answered <strong style={{ color: "#0B1F3A" }}>{result.score} out of {result.totalPlates}</strong> correctly
                  </p>
                  {/* Simple bar */}
                  <div style={{ display: "flex", gap: "4px", height: "12px", borderRadius: "6px", overflow: "hidden", maxWidth: "300px", margin: "0 auto" }}>
                    <div style={{ flex: result.score, background: "#16a34a", borderRadius: "6px 0 0 6px" }} />
                    {result.score < result.totalPlates && (
                      <div style={{ flex: result.totalPlates - result.score, background: "#dc2626", borderRadius: "0 6px 6px 0" }} />
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a", display: "inline-block" }} /> Correct
                    </span>
                    <span style={{ fontSize: "11px", color: "#dc2626", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#dc2626", display: "inline-block" }} /> Incorrect
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.75, marginBottom: "20px" }}>{result.description}</p>

                {/* Recommendation */}
                <div style={{ background: "#1a2744", borderRadius: "10px", padding: "18px 20px", borderLeft: "4px solid #c9933a", marginBottom: "24px" }}>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", lineHeight: 1.7 }}>{result.recommendation}</p>
                </div>

                {/* Professional referral */}
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "16px 18px", marginBottom: "28px" }}>
                  <p style={{ fontSize: "13px", color: "#92400e", lineHeight: 1.7 }}>
                    <strong>⚕ Important:</strong> This result is a preliminary indication only. Please consult a qualified ophthalmologist for a comprehensive colour vision evaluation and professional diagnosis. Do not make any medical decisions based on this result alone.
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Link href="/hospital#appointment" className="btn-primary btn-gold" style={{ fontSize: "13px", padding: "12px 24px", flex: 1, textAlign: "center" }}>
                    Book an Eye Consultation
                  </Link>
                  <button onClick={handleReset}
                    style={{ flex: 1, fontSize: "13px", padding: "12px 24px", borderRadius: "999px", border: "1.5px solid #1a2744", background: "transparent", color: "#1a2744", cursor: "pointer", fontWeight: 500 }}>
                    Take Test Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
