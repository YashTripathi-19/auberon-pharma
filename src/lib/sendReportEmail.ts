import nodemailer from "nodemailer";
import { ReportData } from "./generateReportData";
import { dailyReportTemplate } from "@/lib/email-templates";

export async function sendReportEmail(pdfBuffer: Buffer, data: ReportData): Promise<void> {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error("GMAIL_USER or GMAIL_APP_PASSWORD not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  const dateStr = data.generatedAt.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const fileDate = data.generatedAt.toISOString().split("T")[0];

  const { subject, html } = dailyReportTemplate({
    date: dateStr,
    totalOrders: data.orders.last24h,
    revenue: data.revenue.last24h,
    newUsers: data.customers.newSignups24h,
    lowStock: data.products.lowStock.map(p => p.name),
  });

  await transporter.sendMail({
    from: `"Auberon Pharmaceuticals" <${GMAIL_USER}>`,
    to: "auberon.pharma@gmail.com",
    subject,
    html,
    attachments: [
      {
        filename: `auberon-report-${fileDate}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}
