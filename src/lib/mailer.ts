import nodemailer from "nodemailer";
import { otpEmailTemplate, contactReplyTemplate } from "@/lib/email-templates";

// Singleton transporter — reuse the SMTP connection instead of creating a new one per send.
// This eliminates the ~1-2s TCP handshake overhead on every email.
let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      pool: true,          // keep SMTP connection alive
      maxConnections: 3,   // allow up to 3 concurrent sends
      rateDelta: 1000,     // 1 second between batches
      rateLimit: 5,        // max 5 messages per rateDelta
    });
  }
  return _transporter;
}

export async function sendOtpEmail(to: string, name: string, otp: string) {
  const transporter = getTransporter();
  const { subject, html } = otpEmailTemplate({ name, otp });
  await transporter.sendMail({
    from: `"Auberon Pharmaceuticals" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

export async function sendContactEmail(data: {
  name: string; email: string; phone: string; subject: string; message: string;
}) {
  const transporter = getTransporter();
  // Internal admin notification — keep as plain structured HTML (not a customer-facing template)
  await transporter.sendMail({
    from: `"Auberon Pharmaceuticals" <${process.env.GMAIL_USER}>`,
    to: "auberon.pharma@gmail.com",
    subject: "New Contact Form Submission — Auberon Pharmaceuticals",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#0B1F3A;margin-bottom:24px">New Contact Form Submission</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;width:80px">Name</td><td style="padding:8px 0;font-size:13px;color:#111">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7280;font-size:13px">Email</td><td style="padding:8px 0;font-size:13px;color:#111">${data.email}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7280;font-size:13px">Phone</td><td style="padding:8px 0;font-size:13px;color:#111">${data.phone || "Not provided"}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7280;font-size:13px">Subject</td><td style="padding:8px 0;font-size:13px;color:#111">${data.subject}</td></tr>
        </table>
        <div style="margin-top:24px;padding:16px;background:#F5F5F7;border-radius:8px">
          <p style="font-size:12px;color:#6B7280;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.08em">Message</p>
          <p style="font-size:14px;color:#111;white-space:pre-wrap;margin:0">${data.message}</p>
        </div>
      </div>
    `,
  });
}

export async function sendContactReply(to: string, name: string, replyMessage: string) {
  const transporter = getTransporter();
  const { subject, html } = contactReplyTemplate({ name, replyMessage });
  await transporter.sendMail({
    from: `"Auberon Pharmaceuticals" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
