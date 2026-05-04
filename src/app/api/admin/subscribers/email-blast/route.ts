import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getSubscribers, getUsers } from "@/lib/db";
import nodemailer from "nodemailer";
import { newsletterTemplate } from "@/lib/email-templates";

function deduplicateByEmail(list: { email: string; name: string }[]) {
  const seen = new Set<string>();
  return list.filter((item) => {
    const key = item.email.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildRecipientList(recipients: string | string[]): { email: string; name: string }[] {
  const subscribers = getSubscribers().filter((s) => s.isActive);
  const users = getUsers();
  const userRoleMap = new Map(users.map((u) => [u.email.toLowerCase(), { role: u.role, name: u.name }]));

  if (recipients === "subscribers-only") {
    return subscribers.map((s) => ({ email: s.email, name: userRoleMap.get(s.email.toLowerCase())?.name || s.email }));
  }

  if (recipients === "all") {
    const allUsers = users.map((u) => ({ email: u.email, name: u.name }));
    const subEmails = new Set(users.map((u) => u.email.toLowerCase()));
    const subOnly = subscribers.filter((s) => !subEmails.has(s.email.toLowerCase())).map((s) => ({ email: s.email, name: s.email }));
    return deduplicateByEmail([...allUsers, ...subOnly]);
  }

  const roleMap: Record<string, string> = { customers: "customer", wholesalers: "wholesaler", clinics: "clinic" };
  const targetRole = roleMap[recipients as string];
  if (targetRole) {
    const roleUsers = users.filter((u) => u.role === targetRole && u.isVerified).map((u) => ({ email: u.email, name: u.name }));
    const roleSubscribers = subscribers
      .filter((s) => {
        const info = userRoleMap.get(s.email.toLowerCase());
        const role = s.role || info?.role || "customer";
        return role === targetRole;
      })
      .map((s) => ({ email: s.email, name: userRoleMap.get(s.email.toLowerCase())?.name || s.email }));
    return deduplicateByEmail([...roleUsers, ...roleSubscribers]);
  }

  if (Array.isArray(recipients)) {
    return recipients.map((email) => ({ email, name: userRoleMap.get(email.toLowerCase())?.name || email }));
  }

  return [];
}

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token")?.value;
    if (!adminToken || !(await verifyToken(adminToken))) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { subject, message, recipients } = await req.json();
    if (!subject || !message || !recipients) {
      return NextResponse.json({ error: "subject, message, and recipients are required" }, { status: 400 });
    }

    const recipientList = buildRecipientList(recipients);
    if (recipientList.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, totalRecipients: 0 });
    }

    const transporter = getTransporter();
    let sent = 0;
    let failed = 0;

    for (const recipient of recipientList) {
      const greeting = recipient.name && recipient.name !== recipient.email ? `Dear ${recipient.name.split(" ")[0]}` : "Dear Valued Customer";
      try {
        const personalised = `${greeting},\n\n${message}`;
        const { subject: emailSubject, html } = newsletterTemplate({
          subject,
          body: personalised.replace(/\n/g, "<br/>"),
        });
        await transporter.sendMail({
          from: `"Auberon Pharmaceuticals" <${process.env.GMAIL_USER}>`,
          to: recipient.email,
          subject: emailSubject,
          html,
        });
        sent++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({ sent, failed, totalRecipients: recipientList.length });
  } catch (err) {
    console.error("[email-blast]", err);
    return NextResponse.json({ error: "Failed to send blast" }, { status: 500 });
  }
}
