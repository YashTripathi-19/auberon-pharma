import { NextRequest, NextResponse } from "next/server";
import { getTopCustomersByRole, Period, CustomerRole } from "@/lib/topCustomers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get("role") || "customer") as CustomerRole;
    const period = (searchParams.get("period") || "quarter") as Period;
    const data = getTopCustomersByRole(role, period);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
