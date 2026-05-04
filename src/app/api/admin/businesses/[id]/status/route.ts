import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/db";
import { BusinessStatus } from "@/types/user";
import nodemailer from "nodemailer";

// Valid transitions
const TRANSITIONS: Record<BusinessStatus, BusinessStatus[]> = {
  pending:     ["verified", "rejected"],
  verified:    ["restricted", "banned"],
  rejected:    ["pending"],
  restricted:  ["verified", "banned"],
  banned:      [], // permanent
};

async function sendStatusEmail(user: { name: string; email: string; role: string }, action: BusinessStatus, note: string | null) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !user.email) return;
  const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
  const roleLabel = user.role === "wholesaler" ? "wholesaler" : "clinic/hospital";

  const templates: Partial<Record<BusinessStatus, { subject: string; body: string }>> = {
    verified: {
      subject: "Your Business Account is Verified — Auberon Pharmaceuticals",
      body: `Congratulations ${user.name}! Your ${roleLabel} account has been verified. You now have full access to business features and pricing. Welcome to the Auberon network.`,
    },
    rejected: {
      subject: "Business Account Verification Update — Auberon Pharmaceuticals",
      body: `Dear ${user.name}, we were unable to verify your account.${note ? ` Reason: ${note}.` : ""} Please contact auberon.pharma@gmail.com if you believe this is an error.`,
    },
    restricted: {
      subject: "Your Auberon Account Has Been Restricted",
      body: `Dear ${user.name}, your account has been temporarily restricted.${note ? ` Reason: ${note}.` : ""} Please contact us to resolve this.`,
    },
    banned: {
      subject: "Your Auberon Account Has Been Suspended",
      body: `Dear ${user.name}, your account has been permanently suspended.${note ? ` Reason: ${note}.` : ""} For appeals contact auberon.pharma@gmail.com.`,
    },
  };

  const tmpl = templates[action];
  if (!tmpl) return; // no email for pending (re-review)

  await t.sendMail({
    from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
    to: user.email,
    subject: tmpl.subject,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
      <p style="font-family:Georgia,serif;font-size:1.2rem;font-weight:700;color:#0B1F3A">Auberon Pharmaceuticals</p>
      <p style="font-size:14px;color:#374151;margin-top:20px;line-height:1.7">${tmpl.body}</p>
      <p style="font-size:13px;color:#6B7280;margin-top:24px">— Team Auberon Pharmaceuticals</p>
    </div>`,
  }).catch((err) => console.error("[status-email]", err));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token")?.value;
    if (!adminToken || !(await verifyToken(adminToken))) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { action, note } = await request.json() as { action: BusinessStatus; note?: string | null };
    const user = getUserById(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const currentStatus: BusinessStatus = user.businessStatus || (user.isBusinessVerified ? "verified" : "pending");
    const allowed = TRANSITIONS[currentStatus];

    if (!allowed.includes(action)) {
      return NextResponse.json({ error: `Invalid status transition: ${currentStatus} → ${action}` }, { status: 400 });
    }

    const historyEntry = {
      action,
      note: note || null,
      timestamp: new Date().toISOString(),
    };

    const updated = updateUser(id, {
      businessStatus: action,
      isBusinessVerified: action === "verified",
      verificationNote: note || null,
      verificationHistory: [...(user.verificationHistory || []), historyEntry],
    });

    if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });

    sendStatusEmail({ name: user.name, email: user.email, role: user.role }, action, note || null).catch(() => {});

    const { passwordHash: _, verificationToken: __, ...safe } = updated;
    return NextResponse.json(safe);
  } catch (err) {
    console.error("[business-status]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
