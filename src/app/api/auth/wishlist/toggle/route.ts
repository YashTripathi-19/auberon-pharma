import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyUserToken, USER_COOKIE } from "@/lib/userAuth";
import { getUserById, updateUser } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE)?.value;
    const payload = token ? await verifyUserToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    const user = getUserById(payload.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const wishlist = user.wishlist || [];
    const added = !wishlist.includes(productId);
    const updated = added ? [...wishlist, productId] : wishlist.filter((id) => id !== productId);

    updateUser(payload.userId, { wishlist: updated });
    return NextResponse.json({ wishlist: updated, added });
  } catch (err) {
    console.error("[wishlist-toggle]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
