import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { Appointment } from "@/types/appointment";

function getAppointments(): Appointment[] {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data/appointments.json"), "utf-8")); } catch { return []; }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token")?.value;
    if (!adminToken || !(await verifyToken(adminToken))) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    const apts = getAppointments().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(apts);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
