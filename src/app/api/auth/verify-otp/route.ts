import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, updateUser } from "@/lib/db";

// OTP brute force protection
const otpAttempts = new Map<string, {
  count: number;
  lockedUntil: number;
}>();

const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // OTP brute force check
    const attemptKey = email.toLowerCase();
    const now = Date.now();
    const attempt = otpAttempts.get(attemptKey);

    if (attempt && now < attempt.lockedUntil) {
      const minutesLeft = Math.ceil((attempt.lockedUntil - now) / 60000);
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${minutesLeft} minute(s).` },
        { status: 429 }
      );
    }

    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    if (user.verificationToken !== String(otp)) {
      // Increment failed attempts
      const current = otpAttempts.get(attemptKey) || { count: 0, lockedUntil: 0 };
      const newCount = current.count + 1;
      otpAttempts.set(attemptKey, {
        count: newCount,
        lockedUntil: newCount >= MAX_OTP_ATTEMPTS ? now + OTP_LOCKOUT_MS : 0
      });

      if (newCount >= MAX_OTP_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Try again in 10 minutes.' },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // OTP expiry check — 10 minutes
    if (user.otpCreatedAt) {
      const age = Date.now() - new Date(user.otpCreatedAt).getTime();
      if (age > 10 * 60 * 1000) {
        return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
      }
    }

    // Successful verification — clear attempts
    otpAttempts.delete(attemptKey);

    updateUser(user.id, { isVerified: true, verificationToken: null, otpCreatedAt: null });

    return NextResponse.json({ message: "Account verified successfully" });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
