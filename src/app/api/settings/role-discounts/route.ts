import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json(settings.roleDiscounts);
  } catch {
    return NextResponse.json({ customer: { percentage: 0, isActive: false }, wholesaler: { percentage: 0, isActive: false }, clinic: { percentage: 0, isActive: false } });
  }
}
