import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getSubscribers, getUsers } from "@/lib/db";

function deduplicateEmails(emails: string[]): string[] {
  return [...new Set(emails.map((e) => e.toLowerCase()))];
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token")?.value;
    if (!adminToken || !(await verifyToken(adminToken))) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const role = new URL(request.url).searchParams.get("role") || "all";
    const subscribers = getSubscribers().filter((s) => s.isActive);
    const users = getUsers();
    const userRoleMap = new Map(users.map((u) => [u.email.toLowerCase(), u.role]));

    let emails: string[] = [];

    if (role === "subscribers-only") {
      emails = subscribers.map((s) => s.email);
    } else if (role === "all") {
      const allUserEmails = users.map((u) => u.email);
      const subEmails = subscribers.filter((s) => !users.some((u) => u.email.toLowerCase() === s.email.toLowerCase())).map((s) => s.email);
      emails = [...allUserEmails, ...subEmails];
    } else {
      const roleMap: Record<string, string> = { customers: "customer", wholesalers: "wholesaler", clinics: "clinic" };
      const targetRole = roleMap[role] || role;
      const roleUserEmails = users.filter((u) => u.role === targetRole && u.isVerified).map((u) => u.email);
      const roleSubEmails = subscribers.filter((s) => {
        const r = s.role || userRoleMap.get(s.email.toLowerCase()) || "customer";
        return r === targetRole;
      }).map((s) => s.email);
      emails = [...roleUserEmails, ...roleSubEmails];
    }

    return NextResponse.json({ count: deduplicateEmails(emails).length });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
