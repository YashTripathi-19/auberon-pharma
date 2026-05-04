import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";

export async function GET() {
  try {
    const settings = getSettings() as Record<string, unknown>;
    const hw = (settings.hospitalWing as { isPublic: boolean; showInNav: boolean; showHomeTeaser: boolean; showSupportCard: boolean }) || { isPublic: false, showInNav: false, showHomeTeaser: false, showSupportCard: false };
    return NextResponse.json(hw);
  } catch {
    return NextResponse.json({ isPublic: false, showInNav: false, showHomeTeaser: false, showSupportCard: false });
  }
}
