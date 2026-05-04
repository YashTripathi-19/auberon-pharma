import { NextResponse } from "next/server";
import { getBusinessUsers } from "@/lib/db";

export async function GET() {
  try {
    const users = getBusinessUsers();
    const total = users.length;
    const pendingVerification = users.filter((u) => !u.isBusinessVerified).length;
    return NextResponse.json({ total, pendingVerification });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
