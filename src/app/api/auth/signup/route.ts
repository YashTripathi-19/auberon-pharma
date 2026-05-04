import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserByPhone, saveUser, addSubscriber, markSubscriberConverted, syncSubscriberRole } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mailer";
import { verifyRecaptcha } from "@/lib/recaptcha";
import nodemailer from "nodemailer";

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const baseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["customer", "wholesaler", "clinic"]).default("customer"),
  subscribe: z.boolean().optional(),
  recaptchaToken: z.string().optional(),
  // Wholesaler
  businessName: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  businessAddress: z.string().optional().nullable(),
  yearsInBusiness: z.number().optional().nullable(),
  // Clinic
  institutionName: z.string().optional().nullable(),
  institutionType: z.enum(["hospital", "clinic", "individual"]).optional().nullable(),
  doctorRegNumber: z.string().optional().nullable(),
  specialisation: z.string().optional().nullable(),
  yearsOfPractice: z.number().optional().nullable(),
});

function generateOtp() { return Math.floor(100000 + Math.random() * 900000).toString(); }
function generateId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }

// Password strength validation
function validatePassword(password: string): string | null {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null; // valid
}

async function notifyAdmin(data: Record<string, unknown>) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return;
  const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
  const lines = Object.entries(data).filter(([, v]) => v != null).map(([k, v]) => `${k}: ${v}`).join("\n");
  await t.sendMail({
    from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
    to: "auberon.pharma@gmail.com",
    subject: `New Business Registration — ${data.role} — ${data.businessName || data.institutionName || data.name}`,
    text: `New business account pending verification:\n\n${lines}`,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = baseSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation failed" }, { status: 400 });

    const d = parsed.data;

    // Password strength validation
    const passwordError = validatePassword(d.password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Email normalisation
    d.email = d.email.toLowerCase().trim();

    // Name sanitisation
    d.name = d.name.trim().slice(0, 100);

    if (d.recaptchaToken) {
      const ok = await verifyRecaptcha(d.recaptchaToken);
      if (!ok) return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 400 });
    }

    if (d.role === "wholesaler") {
      if (!d.businessName?.trim()) return NextResponse.json({ error: "Business name is required" }, { status: 400 });
      if (!d.gstNumber?.trim()) return NextResponse.json({ error: "GST number is required" }, { status: 400 });
      if (!GST_REGEX.test(d.gstNumber.trim())) return NextResponse.json({ error: "Invalid GST number format" }, { status: 400 });
      if (!d.businessAddress?.trim()) return NextResponse.json({ error: "Business address is required" }, { status: 400 });
    }
    if (d.role === "clinic") {
      if (!d.institutionName?.trim()) return NextResponse.json({ error: "Institution name is required" }, { status: 400 });
      if (!d.institutionType) return NextResponse.json({ error: "Institution type is required" }, { status: 400 });
      if (!d.doctorRegNumber?.trim()) return NextResponse.json({ error: "Doctor registration number is required" }, { status: 400 });
      if (!d.specialisation?.trim()) return NextResponse.json({ error: "Specialisation is required" }, { status: 400 });
      if (!d.businessAddress?.trim()) return NextResponse.json({ error: "Business address is required" }, { status: 400 });
    }

    if (getUserByEmail(d.email)) return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    if (getUserByPhone(d.phone)) return NextResponse.json({ error: "An account with this phone number already exists" }, { status: 400 });

    const passwordHash = await bcrypt.hash(d.password, 10);
    const otp = generateOtp();

    const user = {
      id: generateId(),
      name: d.name, email: d.email, phone: d.phone, passwordHash,
      isVerified: false, verificationToken: otp,
      otpCreatedAt: new Date().toISOString(),
      verificationMethod: "email" as const,
      createdAt: new Date().toISOString(),
      role: d.role,
      isBusinessVerified: d.role === "customer",
      verificationNote: null,
      avatar: null, address: null, gender: null, dateOfBirth: null,
      businessName: d.businessName ?? null,
      gstNumber: d.gstNumber ?? null,
      businessAddress: d.businessAddress ?? null,
      yearsInBusiness: d.yearsInBusiness ?? null,
      institutionName: d.institutionName ?? null,
      institutionType: d.institutionType ?? null,
      doctorRegNumber: d.doctorRegNumber ?? null,
      specialisation: d.specialisation ?? null,
      yearsOfPractice: d.yearsOfPractice ?? null,
    };

    saveUser(user);

    if (d.subscribe) { try { addSubscriber(d.email, "Signup", d.role); } catch { /* silent */ } }
    try { markSubscriberConverted(d.email); } catch { /* silent */ }
    // Sync role to subscribers.json if already subscribed
    try { syncSubscriberRole(d.email, d.role); } catch { /* silent */ }

    try { await sendOtpEmail(d.email, d.name, otp); }
    catch (err) { console.error("[signup] OTP email failed:", err); }

    if (d.role !== "customer") {
      notifyAdmin({ ...d, password: undefined, recaptchaToken: undefined })
        .catch((e) => console.error("[signup] admin notify failed:", e));
    }

    return NextResponse.json({ message: "OTP sent to your email" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
