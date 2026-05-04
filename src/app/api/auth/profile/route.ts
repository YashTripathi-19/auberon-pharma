import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyUserToken, USER_COOKIE } from "@/lib/userAuth";
import { getUserById, updateUser } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional().or(z.literal("")),
  address: z.string().optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  // Business fields
  businessName: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  businessAddress: z.string().optional().nullable(),
  yearsInBusiness: z.number().optional().nullable(),
  institutionName: z.string().optional().nullable(),
  institutionType: z.enum(["hospital", "clinic", "individual"]).optional().nullable(),
  doctorRegNumber: z.string().optional().nullable(),
  specialisation: z.string().optional().nullable(),
  yearsOfPractice: z.number().optional().nullable(),
});

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = await verifyUserToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }

    // Only update fields that were actually provided
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) updates[key] = value;
    }

    const updated = updateUser(payload.userId, updates);
    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Return safe profile — never expose passwordHash or verificationToken
    const { passwordHash: _, verificationToken: __, ...safe } = updated;
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
