import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";

export async function GET() {
  try {
    const settings = getSettings() as Record<string, unknown>;
    const tax = (settings.taxAndCharges as { sgst: number; cgst: number; handlingCharge: number; freeShippingAbove: number }) || { sgst: 6, cgst: 6, handlingCharge: 25, freeShippingAbove: 500 };
    return NextResponse.json(tax);
  } catch {
    return NextResponse.json({ sgst: 6, cgst: 6, handlingCharge: 25, freeShippingAbove: 500 });
  }
}
