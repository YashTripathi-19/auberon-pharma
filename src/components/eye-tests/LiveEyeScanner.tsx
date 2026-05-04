"use client"

import { useState, useRef, useEffect, useCallback } from "react"

interface ScanResult {
  conjunctivitis: {
    likelihood: "unlikely" | "possible" | "likely"
    confidence: number
    severity: "none" | "mild" | "moderate" | "severe"
    indicators: string[]
  }
  cataract: {
    likelihood: "unlikely" | "possible" | "likely"
    confidence: number
    severity: "none" | "early" | "moderate" | "advanced"
    indicators: string[]
  }
  overallRecommendation: string
  requiresUrgentCare: boolean
}

export default function LiveEyeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [phase, setPhase] = useState<
    "disclaimer" | "setup" | "scanning" | "result" | "error"
  >("disclaimer")
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [scanCount, setScanCount] = useState(0)
  const [selectedCondition, setSelectedCondition] = useState<
    "both" | "conjunctivitis" | "cataract"
  >("both")

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setPhase("scanning")
      setCameraError(null)
    } catch {
      setCameraError(
        "Camera access denied. Please allow camera access in your browser settings and try again."
      )
      setPhase("error")
    }
  }, [facingMode])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
  }, [])

  // Capture frame from video
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL("image/jpeg", 0.8)
  }, [])

  // Run analysis
  const runScan = useCallback(async () => {
    if (isAnalysing) return
    setIsAnalysing(true)
    setScanProgress(0)

    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 300)

    try {
      const frame = captureFrame()
      if (!frame) throw new Error("Could not capture frame")

      const response = await fetch("/api/eye-tests/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: frame })
      })

      if (!response.ok) throw new Error("Analysis failed")
      const data = await response.json()

      clearInterval(progressInterval)
      setScanProgress(100)

      setTimeout(() => {
        setResult(data)
        setPhase("result")
        stopCamera()
      }, 500)
    } catch {
      clearInterval(progressInterval)
      setCameraError("Analysis failed. Please try again.")
      setIsAnalysing(false)
      setScanProgress(0)
    }
  }, [isAnalysing, captureFrame, stopCamera])

  // Auto-scan after 3 seconds of camera being active
  useEffect(() => {
    if (phase === "scanning") {
      const timer = setTimeout(() => {
        setScanCount(c => c + 1)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  useEffect(() => {
    if (scanCount > 0 && phase === "scanning") {
      runScan()
    }
  }, [scanCount, phase, runScan])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  const reset = () => {
    setPhase("disclaimer")
    setResult(null)
    setIsAnalysing(false)
    setScanProgress(0)
    setScanCount(0)
    setCameraError(null)
  }

  const likelihoodColor = (l: string) =>
    l === "likely" ? "#dc2626" : l === "possible" ? "#f59e0b" : "#16a34a"

  const likelihoodLabel = (l: string) =>
    l === "likely" ? "Signs Detected" : l === "possible" ? "Inconclusive" : "No Signs Detected"

  const severityLabel = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px" }}>

      {/* ── DISCLAIMER ── */}
      {phase === "disclaimer" && (
        <div style={{ textAlign: "center" }}>
          <div style={{
            background: "#fdf6e3",
            border: "1px solid #c9933a",
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
            textAlign: "left"
          }}>
            <p style={{ fontWeight: 700, color: "#1a2744", marginBottom: 12 }}>
              Please read before starting:
            </p>
            {[
              "This tool provides a preliminary screening only — NOT a medical diagnosis",
              "Accuracy depends on lighting, camera quality, and eye positioning",
              "Results are based on colour analysis and may not be accurate",
              "Never make medical decisions based on this tool alone",
              "If you experience eye pain, vision changes, or discharge — seek immediate care"
            ].map((item, i) => (
              <p key={i} style={{ color: "#374151", fontSize: 14, marginBottom: 8 }}>
                • {item}
              </p>
            ))}
          </div>

          {/* Condition selector */}
          <p style={{ color: "#6b7280", marginBottom: 16, fontSize: 14 }}>
            Select what you want to check:
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
            {(["both", "conjunctivitis", "cataract"] as const).map(c => (
              <button
                key={c}
                onClick={() => setSelectedCondition(c)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 999,
                  border: "2px solid",
                  borderColor: selectedCondition === c ? "#c9933a" : "#e5e7eb",
                  background: selectedCondition === c ? "#c9933a" : "white",
                  color: selectedCondition === c ? "white" : "#1a2744",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "all 0.2s"
                }}
              >
                {c === "both" ? "Both Conditions" : c === "conjunctivitis" ? "Conjunctivitis" : "Cataract"}
              </button>
            ))}
          </div>

          {/* Camera facing selector */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32 }}>
            {(["user", "environment"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFacingMode(mode)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid",
                  borderColor: facingMode === mode ? "#1a2744" : "#e5e7eb",
                  background: facingMode === mode ? "#1a2744" : "white",
                  color: facingMode === mode ? "white" : "#6b7280",
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                {mode === "user" ? "📷 Front Camera" : "📸 Back Camera"}
              </button>
            ))}
          </div>

          <button
            onClick={() => { setPhase("setup"); startCamera() }}
            style={{
              background: "#c9933a",
              color: "white",
              border: "none",
              borderRadius: 999,
              padding: "14px 40px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              marginRight: 12
            }}
          >
            I Understand — Start Scan
          </button>
          <a href="/" style={{ color: "#6b7280", fontSize: 14 }}>
            Back to Home
          </a>
        </div>
      )}

      {/* ── SETUP / LOADING CAMERA ── */}
      {phase === "setup" && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{
            width: 48, height: 48,
            border: "4px solid #e5e7eb",
            borderTopColor: "#c9933a",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }} />
          <p style={{ color: "#1a2744", fontWeight: 600 }}>Starting camera...</p>
          <p style={{ color: "#6b7280", fontSize: 14 }}>Please allow camera access when prompted</p>
        </div>
      )}

      {/* ── SCANNING ── */}
      {phase === "scanning" && (
        <div>
          <div style={{
            background: "#1a2744",
            color: "white",
            borderRadius: 12,
            padding: "12px 20px",
            marginBottom: 16,
            textAlign: "center",
            fontSize: 14
          }}>
            👁 Position your eye close to the camera in good lighting — scan starts automatically
          </div>

          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", display: "block", borderRadius: 16 }}
            />
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 160,
              height: 160,
              border: "3px solid rgba(201,147,58,0.8)",
              borderRadius: "50%",
              pointerEvents: "none"
            }} />
            <div style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.6)",
              color: "white",
              fontSize: 12,
              padding: "4px 12px",
              borderRadius: 999
            }}>
              Centre your eye within the circle
            </div>
          </div>

          {isAnalysing && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                fontSize: 13,
                color: "#6b7280"
              }}>
                <span>Analysing...</span>
                <span>{scanProgress}%</span>
              </div>
              <div style={{
                height: 6,
                background: "#e5e7eb",
                borderRadius: 3,
                overflow: "hidden"
              }}>
                <div style={{
                  height: "100%",
                  width: `${scanProgress}%`,
                  background: "#c9933a",
                  borderRadius: 3,
                  transition: "width 0.3s ease"
                }} />
              </div>
            </div>
          )}

          <button
            onClick={runScan}
            disabled={isAnalysing}
            style={{
              width: "100%",
              padding: "14px",
              background: isAnalysing ? "#e5e7eb" : "#c9933a",
              color: isAnalysing ? "#9ca3af" : "white",
              border: "none",
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 600,
              cursor: isAnalysing ? "not-allowed" : "pointer"
            }}
          >
            {isAnalysing ? "Analysing..." : "📷 Capture & Analyse Now"}
          </button>
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      )}

      {/* ── ERROR ── */}
      {phase === "error" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📵</div>
          <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: 8 }}>
            {cameraError}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "12px 32px",
              background: "#1a2744",
              color: "white",
              border: "none",
              borderRadius: 999,
              cursor: "pointer",
              marginTop: 16
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── RESULT ── */}
      {phase === "result" && result && (
        <div>
          {result.requiresUrgentCare && (
            <div style={{
              background: "#dc2626",
              color: "white",
              borderRadius: 12,
              padding: "12px 20px",
              marginBottom: 20,
              textAlign: "center",
              fontWeight: 600
            }}>
              ⚠ Urgent: Please consult an ophthalmologist immediately
            </div>
          )}

          {(selectedCondition === "both" || selectedCondition === "conjunctivitis") && (
            <div style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
              border: `2px solid ${likelihoodColor(result.conjunctivitis.likelihood)}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ color: "#1a2744", margin: 0, fontSize: 18, fontWeight: 700 }}>
                  Conjunctivitis
                </h3>
                <span style={{
                  background: likelihoodColor(result.conjunctivitis.likelihood),
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600
                }}>
                  {likelihoodLabel(result.conjunctivitis.likelihood)}
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
                  <span>Confidence</span>
                  <span>{result.conjunctivitis.confidence}%</span>
                </div>
                <div style={{ height: 8, background: "#f3f4f6", borderRadius: 4 }}>
                  <div style={{
                    height: "100%",
                    width: `${result.conjunctivitis.confidence}%`,
                    background: likelihoodColor(result.conjunctivitis.likelihood),
                    borderRadius: 4,
                    transition: "width 1s ease"
                  }} />
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
                Severity: <strong style={{ color: "#1a2744" }}>{severityLabel(result.conjunctivitis.severity)}</strong>
              </p>

              {result.conjunctivitis.indicators.map((ind, i) => (
                <p key={i} style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>
                  • {ind}
                </p>
              ))}
            </div>
          )}

          {(selectedCondition === "both" || selectedCondition === "cataract") && (
            <div style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
              border: `2px solid ${likelihoodColor(result.cataract.likelihood)}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ color: "#1a2744", margin: 0, fontSize: 18, fontWeight: 700 }}>
                  Cataract
                </h3>
                <span style={{
                  background: likelihoodColor(result.cataract.likelihood),
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600
                }}>
                  {likelihoodLabel(result.cataract.likelihood)}
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
                  <span>Confidence</span>
                  <span>{result.cataract.confidence}%</span>
                </div>
                <div style={{ height: 8, background: "#f3f4f6", borderRadius: 4 }}>
                  <div style={{
                    height: "100%",
                    width: `${result.cataract.confidence}%`,
                    background: likelihoodColor(result.cataract.likelihood),
                    borderRadius: 4,
                    transition: "width 1s ease"
                  }} />
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
                Severity: <strong style={{ color: "#1a2744" }}>{severityLabel(result.cataract.severity)}</strong>
              </p>

              {result.cataract.indicators.map((ind, i) => (
                <p key={i} style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>
                  • {ind}
                </p>
              ))}
            </div>
          )}

          {/* Overall recommendation */}
          <div style={{
            background: "#1a2744",
            borderLeft: "4px solid #c9933a",
            borderRadius: "0 12px 12px 0",
            padding: 20,
            marginBottom: 20
          }}>
            <p style={{ color: "#c9933a", fontWeight: 700, marginBottom: 8, fontSize: 14 }}>
              ⚕ Recommendation
            </p>
            <p style={{ color: "white", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              {result.overallRecommendation}
            </p>
          </div>

          {/* Disclaimer */}
          <div style={{
            background: "#fdf6e3",
            border: "1px solid #c9933a",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            fontSize: 13,
            color: "#374151",
            lineHeight: 1.6
          }}>
            <strong>Important Disclaimer:</strong> This is a preliminary screening tool only and does NOT constitute a medical diagnosis. Results are based on colour analysis and may be affected by lighting, camera quality, and positioning. Always consult a qualified ophthalmologist for proper diagnosis and treatment. Do not make any medical decisions based on these results alone.
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="/hospital#appointment"
              style={{
                flex: 1,
                padding: "14px 24px",
                background: "#c9933a",
                color: "white",
                borderRadius: 999,
                textAlign: "center",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: 15
              }}
            >
              Book Eye Consultation
            </a>
            <button
              onClick={reset}
              style={{
                flex: 1,
                padding: "14px 24px",
                background: "white",
                color: "#1a2744",
                border: "2px solid #1a2744",
                borderRadius: 999,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 15
              }}
            >
              Scan Again
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
