import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "auberon-pharma-jwt-secret-key-2024-very-secure"
);

const COOKIE_NAME = "admin_token";

export async function signToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    // Explicitly check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      throw new Error('Token expired');
    }
    return true;
  } catch {
    return false;
  }
}

export async function getTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

// Check if token expires within 24 hours
export function isTokenExpiringSoon(payload: any): boolean {
  if (!payload.exp) return false;
  const hoursLeft = (payload.exp - Date.now() / 1000) / 3600;
  return hoursLeft < 24;
}

export { COOKIE_NAME };
