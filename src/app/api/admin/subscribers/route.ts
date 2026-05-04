import { NextResponse } from "next/server";
import { getSubscribers } from "@/lib/db";

export async function GET() {
  const subscribers = getSubscribers().sort(
    (a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
  );
  return NextResponse.json(subscribers);
}
