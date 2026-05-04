import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";

const dataDir = path.join(process.cwd(), "data");

interface ProductRating {
  productName: string;
  rating: number;
}

interface Feedback {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  overallRating: number;
  message: string;
  productRatings: ProductRating[];
  submittedAt: string;
}

function readFeedback(): Feedback[] {
  const filePath = path.join(dataDir, "feedback.json");
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data) as Feedback[];
}

export async function GET(request: NextRequest) {
  try {
    // Admin JWT auth check
    const token = await getTokenFromCookies();
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read and sort feedback by submittedAt descending (newest first)
    const feedback = readFeedback();
    feedback.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
