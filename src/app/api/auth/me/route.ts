import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyUserToken, USER_COOKIE } from "@/lib/userAuth";
import { getUserById } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyUserToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json({
      name: user.name, email: user.email, phone: user.phone,
      role: user.role ?? "customer",
      avatar: user.avatar ?? null, address: user.address ?? null,
      gender: user.gender ?? null, dateOfBirth: user.dateOfBirth ?? null,
      createdAt: user.createdAt,
      isBusinessVerified: user.isBusinessVerified ?? true,
      businessStatus: user.businessStatus ?? (user.isBusinessVerified ? "verified" : "pending"),
      verificationNote: user.verificationNote ?? null,
      businessName: user.businessName ?? null,
      gstNumber: user.gstNumber ?? null,
      businessAddress: user.businessAddress ?? null,
      yearsInBusiness: user.yearsInBusiness ?? null,
      institutionName: user.institutionName ?? null,
      institutionType: user.institutionType ?? null,
      doctorRegNumber: user.doctorRegNumber ?? null,
      specialisation: user.specialisation ?? null,
      yearsOfPractice: user.yearsOfPractice ?? null,
      wishlist: user.wishlist || [],
    });
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}
