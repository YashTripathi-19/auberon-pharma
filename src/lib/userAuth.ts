import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "auberon-pharma-jwt-secret-key-2024-very-secure"
);

export const USER_COOKIE = "user-token";

export interface UserTokenPayload {
  userId: string;
  email: string;
  role: "user";
}

export async function signUserToken(payload: UserTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifyUserToken(token: string): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    // Explicitly check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      throw new Error('Token expired');
    }
    return payload as unknown as UserTokenPayload;
  } catch {
    return null;
  }
}

// Check if token expires within 24 hours
export function isTokenExpiringSoon(payload: any): boolean {
  if (!payload.exp) return false;
  const hoursLeft = (payload.exp - Date.now() / 1000) / 3600;
  return hoursLeft < 24;
}
