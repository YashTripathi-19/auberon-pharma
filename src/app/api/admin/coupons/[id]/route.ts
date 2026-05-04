import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { updateCoupon, deleteCoupon } from "@/lib/db";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return token ? await verifyToken(token) : false;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  if (body.code) body.code = String(body.code).toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const updated = updateCoupon(id, body);
  if (!updated) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const { id } = await params;
  const ok = deleteCoupon(id);
  if (!ok) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
