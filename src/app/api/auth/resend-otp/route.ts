import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, updateUser } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mailer";
import { sendOtpSms } from "@/lib/twilio";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email, verificationMethod } = await request.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const user = getUserByEmail(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.isVerified) return NextResponse.json({ error: "Account already verified" }, { status: 400 });

    const otp = generateOtp();
    const method = verificationMethod || user.verificationMethod || "email";
    updateUser(user.id, { verificationToken: otp, otpCreatedAt: new Date().toISOString(), verificationMethod: method });

    if (method === "phone") {
      try {
        await sendOtpSms(user.phone, otp);
      } catch (err) {
        console.error("[resend-otp] SMS failed, falling back to email:", err);
        try { await sendOtpEmail(email, user.name, otp); } catch { /* silent */ }
      }
    } else {
      try {
        await sendOtpEmail(email, user.name, otp);
      } catch (err) {
        console.error("[resend-otp] Failed to send:", err);
      }
    }

    return NextResponse.json({ message: `OTP resent to your ${method}` });
  } catch {
    return NextResponse.json({ error: "Failed to resend OTP" }, { status: 500 });
  }
}
