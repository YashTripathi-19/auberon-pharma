import { NextResponse } from "next/server";
import { getBusinessUsers } from "@/lib/db";

export async function GET() {
  try {
    const users = getBusinessUsers();
    // Strip sensitive fields
    const safe = users.map(({ passwordHash: _, verificationToken: __, ...u }) => u);
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json({ error: "Failed to fetch business users" }, { status: 500 });
  }
}
