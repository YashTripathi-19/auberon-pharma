import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "auberon-pharma-jwt-secret-key-2024-very-secure"
);

// In-memory rate limit store
// Key: IP + route, Value: { count, resetAt }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: { pattern: RegExp; limit: number; windowMs: number }[] = [
  // Auth routes — strict
  { pattern: /^\/api\/auth\/login/, limit: 5, windowMs: 60_000 },
  { pattern: /^\/api\/auth\/signup/, limit: 3, windowMs: 60_000 },
  { pattern: /^\/api\/auth\/verify-otp/, limit: 5, windowMs: 60_000 },
  { pattern: /^\/api\/auth\/resend-otp/, limit: 3, windowMs: 60_000 },
  // Order routes — moderate
  { pattern: /^\/api\/orders/, limit: 20, windowMs: 60_000 },
  // General API — generous
  { pattern: /^\/api\//, limit: 60, windowMs: 60_000 },
];

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const ip = getIP(request);
    const now = Date.now();

    const rule = RATE_LIMITS.find((r) => r.pattern.test(pathname));
    if (rule) {
      const key = `${ip}:${pathname}`;
      const entry = rateLimitStore.get(key);

      if (!entry || now > entry.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + rule.windowMs });
      } else if (entry.count >= rule.limit) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
              'X-RateLimit-Limit': String(rule.limit),
              'X-RateLimit-Remaining': '0',
            },
          }
        );
      } else {
        entry.count++;
      }
    }
  }

  // Block suspicious patterns
  const suspiciousPatterns = [
    /\.\.(\/|\\)/, // path traversal
    /<script/i, // XSS attempt in URL
    /union.*select/i, // SQL injection attempt
    /exec\s*\(/i, // code execution attempt
  ];

  const fullUrl = request.nextUrl.toString();
  if (suspiciousPatterns.some((p) => p.test(fullUrl))) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  // Skip login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, SECRET_KEY);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
