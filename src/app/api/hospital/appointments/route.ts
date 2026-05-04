import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { Appointment } from "@/types/appointment";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(6, "Phone is required"),
  service: z.string().min(1, "Service is required"),
  serviceId: z.string().min(1),
  doctorId: z.string().nullable().optional(),
  doctorName: z.string().nullable().optional(),
  preferredDate: z.string().min(1, "Date is required"),
  preferredTime: z.string().min(1, "Time is required"),
  notes: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
});

function generateId() { return `APT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }

function getAppointments(): Appointment[] {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data/appointments.json"), "utf-8")); } catch { return []; }
}

function saveAppointments(data: Appointment[]) {
  fs.writeFileSync(path.join(process.cwd(), "data/appointments.json"), JSON.stringify(data, null, 2));
}

async function sendEmails(apt: Appointment) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return;
  const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });

  await t.sendMail({
    from: `"Auberon Eye Care Centre" <${GMAIL_USER}>`,
    to: apt.email,
    subject: "Appointment Request Received — Auberon Eye Care Centre",
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
      <p style="font-family:Georgia,serif;font-size:1.2rem;font-weight:700;color:#0B1F3A">Auberon Eye Care Centre</p>
      <p style="font-size:14px;color:#374151;margin-top:20px">Dear ${apt.name},</p>
      <p style="font-size:14px;color:#374151;line-height:1.7">Thank you for requesting an appointment. Here are your details:</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        <tr><td style="padding:6px 0;color:#6B7280;font-size:13px">Service</td><td style="padding:6px 0;font-size:13px;color:#111">${apt.service}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;font-size:13px">Preferred Date</td><td style="padding:6px 0;font-size:13px;color:#111">${apt.preferredDate}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;font-size:13px">Preferred Time</td><td style="padding:6px 0;font-size:13px;color:#111">${apt.preferredTime}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;font-size:13px">Doctor</td><td style="padding:6px 0;font-size:13px;color:#111">${apt.doctorName || "No preference"}</td></tr>
      </table>
      <p style="font-size:13px;color:#6B7280;margin-top:20px">We will confirm your appointment within 2 hours. For urgent queries call <strong>+91 6307922085</strong>.</p>
      <p style="font-size:13px;color:#6B7280;margin-top:8px">— Auberon Eye Care Centre</p>
    </div>`,
  }).catch(() => {});

  await t.sendMail({
    from: `"Auberon Eye Care Centre" <${GMAIL_USER}>`,
    to: "auberon.pharma@gmail.com",
    subject: `New Appointment Request — ${apt.name} — ${apt.service}`,
    text: `New appointment request:\n\nID: ${apt.id}\nName: ${apt.name}\nEmail: ${apt.email}\nPhone: ${apt.phone}\nService: ${apt.service}\nDoctor: ${apt.doctorName || "No preference"}\nDate: ${apt.preferredDate}\nTime: ${apt.preferredTime}\nNotes: ${apt.notes || "—"}\nCreated: ${apt.createdAt}`,
  }).catch(() => {});
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation failed" }, { status: 400 });

    const d = parsed.data;
    const apt: Appointment = {
      id: generateId(),
      name: d.name, email: d.email, phone: d.phone,
      service: d.service, serviceId: d.serviceId,
      doctorId: d.doctorId || null, doctorName: d.doctorName || null,
      preferredDate: d.preferredDate, preferredTime: d.preferredTime,
      notes: d.notes || null, status: "requested",
      userId: d.userId || null, createdAt: new Date().toISOString(),
    };

    const all = getAppointments();
    all.push(apt);
    saveAppointments(all);

    sendEmails(apt).catch(() => {});
    return NextResponse.json({ success: true, appointmentId: apt.id }, { status: 201 });
  } catch (err) {
    console.error("[appointments]", err);
    return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
  }
}
