import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getRestockNotifications } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token")?.value;
    if (!adminToken || !(await verifyToken(adminToken))) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
    const pending = getRestockNotifications().filter((n) => !n.isNotified);
    return NextResponse.json(pending);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
