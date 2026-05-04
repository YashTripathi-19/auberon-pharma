import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/db";
import { signUserToken, USER_COOKIE } from "@/lib/userAuth";
import { verifyRecaptcha } from "@/lib/recaptcha";

// Brute force protection
const loginAttempts = new Map<string, {
  count: number;
  lockedUntil: number;
}>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const { email, password, recaptchaToken } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Brute force check
    const attemptKey = email.toLowerCase();
    const now = Date.now();
    const attempt = loginAttempts.get(attemptKey);

    if (attempt && now < attempt.lockedUntil) {
      const minutesLeft = Math.ceil((attempt.lockedUntil - now) / 60000);
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${minutesLeft} minute(s).` },
        { status: 429 }
      );
    }

    // reCAPTCHA verification — only block if token present AND score is very low (< 0.3)
    // Using a lenient threshold because Safari autofill legitimately scores lower
    if (recaptchaToken) {
      const ok = await verifyRecaptcha(recaptchaToken, 0.3);
      if (!ok) return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 400 });
    }

    const user = getUserByEmail(email);
    if (!user) {
      // Increment failed attempts
      const current = loginAttempts.get(attemptKey) || { count: 0, lockedUntil: 0 };
      const newCount = current.count + 1;
      loginAttempts.set(attemptKey, {
        count: newCount,
        lockedUntil: newCount >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0
      });

      if (newCount >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Account temporarily locked after too many failed attempts. Try again in 15 minutes.' },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ error: "Please verify your account first" }, { status: 403 });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      // Increment failed attempts
      const current = loginAttempts.get(attemptKey) || { count: 0, lockedUntil: 0 };
      const newCount = current.count + 1;
      loginAttempts.set(attemptKey, {
        count: newCount,
        lockedUntil: newCount >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0
      });

      if (newCount >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Account temporarily locked after too many failed attempts. Try again in 15 minutes.' },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Successful login — clear attempts
    loginAttempts.delete(attemptKey);

    const token = await signUserToken({ userId: user.id, email: user.email, role: "user" });

    const response = NextResponse.json({
      message: "Logged in",
      user: { name: user.name, email: user.email },
    });

    response.cookies.set(USER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
