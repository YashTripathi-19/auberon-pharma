import { NextRequest, NextResponse } from "next/server";
import { calculateResult } from "@/lib/colourBlindnessTest";

// POST /api/eye-tests/colour-blindness
// Accepts: { answers: Record<number, string> }
// Returns: TestResult
// No auth required — public test
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body as { answers: Record<number, string> };

    if (!answers || typeof answers !== "object" || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { message: "answers object is required and must not be empty" },
        { status: 400 }
      );
    }

    const result = calculateResult(answers);

    // Log anonymously for monitoring (no PII)
    console.log(`[colour-blindness-test] Result: ${result.type} | Severity: ${result.severity} | Score: ${result.score}/${result.totalPlates}`);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[colour-blindness-test]", err);
    return NextResponse.json(
      { message: "Failed to process test results" },
      { status: 500 }
    );
  }
}
