import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { Appointment } from "@/types/appointment";

function getAppointments(): Appointment[] {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data/appointments.json"), "utf-8")); } catch { return []; }
}
function saveAppointments(data: Appointment[]) {
  fs.writeFileSync(path.join(process.cwd(), "data/appointments.json"), JSON.stringify(data, null, 2));
}

async function sendStatusEmail(apt: Appointment, status: string) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !apt.email) return;
  const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });

  if (status === "confirmed") {
    await t.sendMail({
      from: `"Auberon Eye Care Centre" <${GMAIL_USER}>`,
      to: apt.email,
      subject: "Appointment Confirmed — Auberon Eye Care Centre",
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <p style="font-family:Georgia,serif;font-size:1.2rem;font-weight:700;color:#0B1F3A">Auberon Eye Care Centre</p>
        <p style="font-size:14px;color:#374151;margin-top:20px">Dear ${apt.name},</p>
        <p style="font-size:14px;color:#374151;line-height:1.7">Your appointment has been <strong>confirmed</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <tr><td style="padding:6px 0;color:#6B7280;font-size:13px">Service</td><td style="padding:6px 0;font-size:13px;color:#111">${apt.service}</td></tr>
          <tr><td style="padding:6px 0;color:#6B7280;font-size:13px">Doctor</td><td style="padding:6px 0;font-size:13px;color:#111">${apt.doctorName || "Assigned on arrival"}</td></tr>
          <tr><td style="padding:6px 0;color:#6B7280;font-size:13px">Date</td><td style="padding:6px 0;font-size:13px;color:#111">${apt.preferredDate}</td></tr>
          <tr><td style="padding:6px 0;color:#6B7280;font-size:13px">Time</td><td style="padding:6px 0;font-size:13px;color:#111">${apt.preferredTime}</td></tr>
          <tr><td style="padding:6px 0;color:#6B7280;font-size:13px">Address</td><td style="padding:6px 0;font-size:13px;color:#111">Kanpur, Uttar Pradesh, India</td></tr>
        </table>
        <p style="font-size:13px;color:#6B7280;margin-top:20px">Please arrive 10 minutes early. See you soon!</p>
        <p style="font-size:13px;color:#6B7280;margin-top:8px">— Auberon Eye Care Centre</p>
      </div>`,
    }).catch(() => {});
  } else if (status === "cancelled") {
    await t.sendMail({
      from: `"Auberon Eye Care Centre" <${GMAIL_USER}>`,
      to: apt.email,
      subject: "Appointment Cancelled — Auberon Eye Care Centre",
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <p style="font-family:Georgia,serif;font-size:1.2rem;font-weight:700;color:#0B1F3A">Auberon Eye Care Centre</p>
        <p style="font-size:14px;color:#374151;margin-top:20px">Dear ${apt.name},</p>
        <p style="font-size:14px;color:#374151;line-height:1.7">Your appointment for <strong>${apt.service}</strong> on ${apt.preferredDate} at ${apt.preferredTime} has been cancelled. Please contact us to reschedule: <strong>+91 6307922085</strong>.</p>
        <p style="font-size:13px;color:#6B7280;margin-top:16px">— Auberon Eye Care Centre</p>
      </div>`,
    }).catch(() => {});
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token")?.value;
    if (!adminToken || !(await verifyToken(adminToken))) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { status } = await request.json();
    const all = getAppointments();
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    all[idx].status = status;
    saveAppointments(all);

    if (status === "confirmed" || status === "cancelled") {
      sendStatusEmail(all[idx], status).catch(() => {});
    }

    return NextResponse.json(all[idx]);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
