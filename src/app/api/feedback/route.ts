import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getOrder } from "@/lib/db";

const dataDir = path.join(process.cwd(), "data");

interface ProductRating {
  productName: string;
  rating: number;
}

interface FeedbackSubmission {
  orderId: string;
  customerName: string;
  customerEmail: string;
  overallRating: number;
  message: string;
  productRatings?: ProductRating[];
  submittedAt: string;
  feedbackType?: string;
}

interface Feedback extends FeedbackSubmission {
  id: string;
  productRatings: ProductRating[];
  feedbackType: string;
}

function readFeedback(): Feedback[] {
  const filePath = path.join(dataDir, "feedback.json");
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data) as Feedback[];
}

function writeFeedback(feedback: Feedback[]): void {
  const filePath = path.join(dataDir, "feedback.json");
  fs.writeFileSync(filePath, JSON.stringify(feedback, null, 2), "utf-8");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as FeedbackSubmission;
    const { orderId, customerName, customerEmail, overallRating, message, productRatings, submittedAt, feedbackType } = body;

    // Validation: required fields
    if (!orderId || !customerName || !customerEmail || overallRating === undefined) {
      return NextResponse.json(
        { error: "orderId, customerName, customerEmail, and overallRating are required" },
        { status: 400 }
      );
    }

    // Validation: overallRating range
    if (overallRating < 1 || overallRating > 5) {
      return NextResponse.json(
        { error: "overallRating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Validation: productRatings (optional)
    if (productRatings && Array.isArray(productRatings)) {
      for (const pr of productRatings) {
        if (pr.rating < 1 || pr.rating > 5) {
          return NextResponse.json(
            { error: "Each productRating.rating must be between 1 and 5" },
            { status: 400 }
          );
        }
      }
    }

    // Check if order exists
    const order = getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if feedback already exists for this order + feedbackType combination
    const existingFeedback = readFeedback();
    const finalFeedbackType = feedbackType || "delivery";
    const duplicate = existingFeedback.find(
      (f) => f.orderId === orderId && f.feedbackType === finalFeedbackType
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "Feedback already submitted for this order" },
        { status: 400 }
      );
    }

    // Create new feedback entry
    const newFeedback: Feedback = {
      id: `fb_${Date.now()}`,
      orderId,
      customerName,
      customerEmail,
      overallRating,
      message: message || "",
      productRatings: productRatings || [],
      submittedAt: submittedAt || new Date().toISOString(),
      feedbackType: finalFeedbackType,
    };

    existingFeedback.push(newFeedback);
    writeFeedback(existingFeedback);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
