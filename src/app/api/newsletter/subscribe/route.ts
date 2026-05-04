import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addSubscriber } from "@/lib/db";
import nodemailer from "nodemailer";
import { newsletterTemplate } from "@/lib/email-templates";

const schema = z.object({ email: z.string().email("Invalid email") });

async function sendEmails(email: string, isResubscribe: boolean) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  const welcomeBody = isResubscribe
    ? "You have been successfully resubscribed to our updates. You will receive product updates, eye health tips, and exclusive offers directly in your inbox."
    : "Thank you for subscribing to Auberon Pharmaceuticals updates. You will receive product updates, eye health tips, and exclusive offers directly in your inbox. We specialise in ophthalmic formulations trusted by eye care professionals across India.";

  const { subject, html } = newsletterTemplate({
    subject: isResubscribe ? "Welcome Back to Auberon Pharmaceuticals" : "Welcome to Auberon Pharmaceuticals Updates",
    body: welcomeBody,
  });

  await transporter.sendMail({
    from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
    to: email,
    subject,
    html,
  });

  // Admin notification — plain text
  await transporter.sendMail({
    from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
    to: "auberon.pharma@gmail.com",
    subject: `New Newsletter Subscriber — ${email}`,
    text: `A new user has subscribed: ${email} at ${new Date().toISOString()}`,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid email" }, { status: 400 });
    }

    const { email } = parsed.data;
    const result = addSubscriber(email);

    if (!result.isNew && !result.wasInactive) {
      return NextResponse.json({ error: "You are already subscribed" }, { status: 400 });
    }

    // Send emails — failure must not block response
    sendEmails(email, result.wasInactive).catch((err) =>
      console.error("[newsletter] Email send failed:", err)
    );

    const message = result.wasInactive
      ? "Welcome back! You have been resubscribed"
      : "Successfully subscribed";

    return NextResponse.json({ message }, { status: result.isNew ? 201 : 200 });
  } catch {
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
