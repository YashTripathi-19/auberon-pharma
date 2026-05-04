import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/lib/db";
import nodemailer from "nodemailer";
import { orderStatusTemplate } from "@/lib/email-templates";

async function sendVerificationEmail(user: { name: string; email: string; role: string }, isVerified: boolean, note?: string) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return;
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
  const roleLabel = user.role === "wholesaler" ? "wholesaler" : "clinic/hospital";

  if (isVerified) {
    const { subject, html } = orderStatusTemplate({
      name: user.name,
      orderId: "Business Account",
      status: "Verified",
      message: `Congratulations! Your ${roleLabel} account has been verified. You now have access to business pricing and bulk order features. Welcome to the Auberon network.`,
    });
    await transporter.sendMail({
      from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
      to: user.email,
      subject: "Your Auberon Pharmaceuticals Business Account is Verified",
      html,
    });
  } else {
    const { subject, html } = orderStatusTemplate({
      name: user.name,
      orderId: "Business Account",
      status: "Verification Update",
      message: `We were unable to verify your ${roleLabel} account at this time.${note ? ` ${note}` : ""} Please contact us at auberon.pharma@gmail.com for assistance.`,
    });
    await transporter.sendMail({
      from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
      to: user.email,
      subject: "Auberon Pharmaceuticals — Business Account Verification Update",
      html,
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { isBusinessVerified, verificationNote } = await request.json();
    const user = getUserById(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updated = updateUser(id, { isBusinessVerified, verificationNote: verificationNote ?? null });
    if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });

    sendVerificationEmail({ name: user.name, email: user.email, role: user.role }, isBusinessVerified, verificationNote)
      .catch((err) => console.error("[verify] Email failed:", err));

    const { passwordHash: _, verificationToken: __, ...safe } = updated;
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
