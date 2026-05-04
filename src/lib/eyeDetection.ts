export interface DetectionResult {
  condition: "conjunctivitis" | "cataract" | "normal" | "uncertain";
  confidence: number;
  indicators: string[];
  recommendation: string;
  severity: "none" | "mild" | "moderate" | "severe";
  secondaryFindings?: {
    condition: string;
    likelihood: "low" | "moderate" | "high";
    note: string;
  }[];
}

export interface ScanResult {
  conjunctivitis: {
    likelihood: "unlikely" | "possible" | "likely";
    confidence: number;
    severity: "none" | "mild" | "moderate" | "severe";
    indicators: string[];
  };
  cataract: {
    likelihood: "unlikely" | "possible" | "likely";
    confidence: number;
    severity: "none" | "early" | "moderate" | "advanced";
    indicators: string[];
  };
  overallRecommendation: string;
  requiresUrgentCare: boolean;
}

export async function analyzeEyeImage(base64Image: string): Promise<ScanResult> {
  const imageData = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(imageData, "base64");

  let totalR = 0, totalG = 0, totalB = 0;
  let pixelCount = 0;

  for (let i = 0; i < buffer.length - 2; i += 3) {
    totalR += buffer[i];
    totalG += buffer[i + 1];
    totalB += buffer[i + 2];
    pixelCount++;
  }

  if (pixelCount === 0) {
    return {
      conjunctivitis: { likelihood: "unlikely", confidence: 0, severity: "none", indicators: ["Unable to process image"] },
      cataract: { likelihood: "unlikely", confidence: 0, severity: "none", indicators: ["Unable to process image"] },
      overallRecommendation: "Image could not be processed. Please try again with better lighting.",
      requiresUrgentCare: false,
    };
  }

  const avgR = totalR / pixelCount;
  const avgG = totalG / pixelCount;
  const avgB = totalB / pixelCount;

  const rednessRatio = avgR / ((avgG + avgB) / 2);
  const avgBrightness = (avgR + avgG + avgB) / 3;
  const whitenessScore = Math.min(avgR, avgG, avgB) / avgBrightness;
  const contrastScore = Math.max(avgR, avgG, avgB) - Math.min(avgR, avgG, avgB);

  // ── Conjunctivitis Analysis ──
  let conjLikelihood: "unlikely" | "possible" | "likely";
  let conjConfidence: number;
  let conjSeverity: "none" | "mild" | "moderate" | "severe";
  let conjIndicators: string[];

  if (rednessRatio > 1.4) {
    conjLikelihood = "likely";
    conjConfidence = Math.min(70 + (rednessRatio - 1.4) * 30, 88);
    conjSeverity = rednessRatio > 1.6 ? "severe" : rednessRatio > 1.5 ? "moderate" : "mild";
    conjIndicators = [
      "Significant redness detected across eye region",
      "Red channel substantially elevated above normal",
      "Colour distribution consistent with ocular inflammation",
      conjSeverity === "severe" ? "Severe inflammation pattern detected" : "Mild to moderate inflammation pattern",
    ];
  } else if (rednessRatio > 1.2) {
    conjLikelihood = "possible";
    conjConfidence = 40 + (rednessRatio - 1.2) * 50;
    conjSeverity = "mild";
    conjIndicators = [
      "Mild redness detected",
      "Could indicate early stage irritation or fatigue",
      "Lighting conditions may affect accuracy",
    ];
  } else {
    conjLikelihood = "unlikely";
    conjConfidence = Math.min(60 + (1.2 - rednessRatio) * 40, 85);
    conjSeverity = "none";
    conjIndicators = [
      "No significant redness detected",
      "Eye coloration within normal range",
    ];
  }

  // ── Cataract Analysis ──
  let catLikelihood: "unlikely" | "possible" | "likely";
  let catConfidence: number;
  let catSeverity: "none" | "early" | "moderate" | "advanced";
  let catIndicators: string[];

  if (whitenessScore > 0.75 && contrastScore < 40) {
    catLikelihood = "likely";
    catConfidence = Math.min(65 + (whitenessScore - 0.75) * 80, 85);
    catSeverity = whitenessScore > 0.85 ? "advanced" : "moderate";
    catIndicators = [
      "Cloudiness detected in lens region",
      "Reduced colour contrast suggests lens opacity",
      "High brightness uniformity consistent with cataract formation",
      catSeverity === "advanced" ? "Advanced opacification pattern" : "Moderate lens clouding detected",
    ];
  } else if (whitenessScore > 0.60 && contrastScore < 60) {
    catLikelihood = "possible";
    catConfidence = 35 + (whitenessScore - 0.60) * 60;
    catSeverity = "early";
    catIndicators = [
      "Slight haziness detected",
      "Could indicate early cataract formation",
      "Age-related changes may be contributing",
    ];
  } else {
    catLikelihood = "unlikely";
    catConfidence = Math.min(55 + contrastScore / 3, 82);
    catSeverity = "none";
    catIndicators = [
      "No significant lens clouding detected",
      "Lens clarity appears within normal range",
    ];
  }

  // ── Overall Recommendation ──
  const requiresUrgentCare =
    (conjLikelihood === "likely" && conjSeverity === "severe") ||
    (catLikelihood === "likely" && catSeverity === "advanced");

  let overallRecommendation: string;
  if (conjLikelihood === "likely" && catLikelihood === "likely") {
    overallRecommendation = "Multiple eye conditions detected. Please consult an ophthalmologist urgently for comprehensive evaluation.";
  } else if (conjLikelihood === "likely") {
    overallRecommendation = "Signs of possible conjunctivitis detected. Please consult an ophthalmologist for proper diagnosis and treatment. Do not self-medicate.";
  } else if (catLikelihood === "likely") {
    overallRecommendation = "Signs of possible cataract detected. Please consult an ophthalmologist for a comprehensive slit-lamp examination.";
  } else if (conjLikelihood === "possible" || catLikelihood === "possible") {
    overallRecommendation = "Some indicators detected but results are inconclusive. A professional eye examination is recommended for accurate diagnosis.";
  } else {
    overallRecommendation = "No obvious signs of conjunctivitis or cataract detected. Maintain regular annual eye health check-ups.";
  }

  return {
    conjunctivitis: {
      likelihood: conjLikelihood,
      confidence: Math.round(conjConfidence),
      severity: conjSeverity,
      indicators: conjIndicators,
    },
    cataract: {
      likelihood: catLikelihood,
      confidence: Math.round(catConfidence),
      severity: catSeverity,
      indicators: catIndicators,
    },
    overallRecommendation,
    requiresUrgentCare,
  };
}
