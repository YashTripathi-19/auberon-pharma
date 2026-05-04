import { NextRequest, NextResponse } from "next/server";
import { saveContact } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { sendContactEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, message" },
        { status: 400 }
      );
    }

    const contact = {
      id: `CON-${generateId()}`,
      name,
      email,
      phone: phone || "",
      subject: subject || "General Inquiry",
      message,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    saveContact(contact);

    // Send email — failure must not block the response
    sendContactEmail({ name, email, phone: phone || "", subject: contact.subject, message })
      .catch((err) => console.error("[contact email] Failed to send:", err));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save contact" }, { status: 500 });
  }
}
