import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyUserToken, USER_COOKIE } from "@/lib/userAuth";
import { getUserById, getProduct, upsertRestockNotification, deleteRestockNotification } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE)?.value;
    const payload = token ? await verifyUserToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

    const { productId, desiredQuantity } = await request.json();
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    const user = getUserById(payload.userId);
    const product = getProduct(productId);
    if (!user || !product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const id = `rn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const entry = upsertRestockNotification(payload.userId, productId, {
      id,
      userId: payload.userId,
      userEmail: user.email,
      userName: user.name,
      productId,
      productName: product.name,
      desiredQuantity: Number(desiredQuantity) || 1,
      notifyWhenAvailable: true,
      createdAt: new Date().toISOString(),
      notifiedAt: null,
      isNotified: false,
    });

    return NextResponse.json({ success: true, notification: entry }, { status: 201 });
  } catch (err) {
    console.error("[restock-notify]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE)?.value;
    const payload = token ? await verifyUserToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

    const { productId } = await request.json();
    deleteRestockNotification(payload.userId, productId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
