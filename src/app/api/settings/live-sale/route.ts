import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";

export async function GET() {
  try {
    const settings = getSettings() as unknown as Record<string, unknown>;
    const liveSale = settings.liveSale || { isActive: false, title: "Flash Sale", subtitle: "", discountPercentage: 0, applicableTo: "all", endsAt: null, bannerColor: "gold", showCountdown: true };
    return NextResponse.json(liveSale);
  } catch {
    return NextResponse.json({ isActive: false });
  }
}
