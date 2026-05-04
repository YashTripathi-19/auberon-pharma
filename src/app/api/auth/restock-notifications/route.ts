import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyUserToken, USER_COOKIE } from "@/lib/userAuth";
import { getRestockNotificationsByUser } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE)?.value;
    const payload = token ? await verifyUserToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    return NextResponse.json(getRestockNotificationsByUser(payload.userId));
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
