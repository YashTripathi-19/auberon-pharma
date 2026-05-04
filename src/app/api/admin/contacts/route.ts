import { NextResponse } from "next/server";
import { getContacts } from "@/lib/db";

// Admin auth is enforced by middleware.ts for all /admin/* routes
export async function GET() {
  try {
    const contacts = getContacts();
    return NextResponse.json(contacts);
  } catch {
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}
