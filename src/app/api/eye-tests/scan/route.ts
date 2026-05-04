import { NextRequest, NextResponse } from "next/server";
import { analyzeEyeImage } from "@/lib/eyeDetection";

// Simple in-memory rate limit: 20 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (limit.count >= 20) return false;
  limit.count++;
  return true;
}

// GET /api/eye-tests/scan — health check
export async function GET() {
  return NextResponse.json({ status: "ok", service: "eye-scan", conditions: ["conjunctivitis", "cataract"] });
}

// POST /api/eye-tests/scan — main analysis endpoint
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ message: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const body = await request.json();
    const { image } = body as { image?: string };

    if (!image || typeof image !== "string" || image.length < 100) {
      return NextResponse.json({ message: "A valid base64 image is required" }, { status: 400 });
    }

    const result = await analyzeEyeImage(image);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[eye-scan]", err);
    return NextResponse.json({ message: "Failed to analyse image" }, { status: 500 });
  }
}
