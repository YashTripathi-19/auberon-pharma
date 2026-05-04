import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { generateReportData } from "@/lib/generateReportData";
import { generateReportPDF } from "@/lib/generateReportPDF";
import { sendReportEmail } from "@/lib/sendReportEmail";

// Auth: accepts either admin JWT cookie (manual trigger) or x-cron-secret header (Vercel cron)
async function isAuthorised(request: NextRequest): Promise<boolean> {
  // Check cron secret header first
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("x-cron-secret") === cronSecret) return true;

  // Fall back to admin JWT cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token && await verifyToken(token)) return true;

  return false;
}

export async function GET(request: NextRequest) {
  try {
    if (!await isAuthorised(request)) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const data = generateReportData();
    const pdf = await generateReportPDF(data);
    await sendReportEmail(pdf, data);

    return NextResponse.json({
      message: "Report generated and sent",
      ordersCount: data.orders.last24h,
      revenue: data.revenue.last24h,
    });
  } catch (err) {
    console.error("[daily-report] Failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Report generation failed" },
      { status: 500 }
    );
  }
}
