import { NextRequest, NextResponse } from "next/server";
import { unsubscribeByEmail } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const success = unsubscribeByEmail(email);
    if (!success) return NextResponse.json({ error: "Email not found" }, { status: 404 });

    return NextResponse.json({ message: "You have been unsubscribed" });
  } catch {
    return NextResponse.json({ error: "Unsubscribe failed" }, { status: 500 });
  }
}
