import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token")?.value;
    if (!adminToken || !(await verifyToken(adminToken))) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
    const hospitalWing = await request.json();
    const settings = getSettings() as unknown as Record<string, unknown>;
    settings.hospitalWing = hospitalWing;
    saveSettings(settings as Parameters<typeof saveSettings>[0]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
