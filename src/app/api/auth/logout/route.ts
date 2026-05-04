import { NextResponse } from "next/server";
import { USER_COOKIE } from "@/lib/userAuth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(USER_COOKIE);
  return response;
}
