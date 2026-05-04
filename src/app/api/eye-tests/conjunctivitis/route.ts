import { NextRequest, NextResponse } from "next/server";
import { analyzeEyeImage } from "@/lib/eyeDetection";

// POST /api/eye-tests/conjunctivitis
// Backward-compatible endpoint — returns only the conjunctivitis portion of ScanResult
// No auth required — public tool
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body as { image?: string };

    if (!image || typeof image !== "string" || image.length < 100) {
      return NextResponse.json({ message: "A valid base64 image is required" }, { status: 400 });
    }

    const result = await analyzeEyeImage(image);

    // Return conjunctivitis-focused response for backward compatibility
    return NextResponse.json({
      likelihood: result.conjunctivitis.likelihood,
      confidence: result.conjunctivitis.confidence,
      severity: result.conjunctivitis.severity,
      indicators: result.conjunctivitis.indicators,
      recommendation: result.overallRecommendation,
      requiresUrgentCare: result.requiresUrgentCare,
    });
  } catch (err) {
    console.error("[conjunctivitis-scan]", err);
    return NextResponse.json({ message: "Failed to analyse image" }, { status: 500 });
  }
}
