import { NextResponse } from "next/server";
import { getSubscribers } from "@/lib/db";

// Admin auth enforced by middleware.ts
export async function GET() {
  try {
    const count = getSubscribers().filter((s) => s.isActive).length;
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 });
  }
}
