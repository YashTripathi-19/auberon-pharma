import { NextResponse } from "next/server";
import { getCategories } from "@/lib/db";

// GET /api/categories — public, returns only active + public categories
export async function GET() {
  try {
    const categories = getCategories();
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 });
  }
}
