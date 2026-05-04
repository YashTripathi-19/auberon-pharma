import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const order = getOrder(id);
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Return safe public fields only (no payment details or sensitive info)
    const publicOrderData = {
      id: order.id,
      items: order.items || [],
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      status: order.status,
      createdAt: order.createdAt,
    };

    return NextResponse.json(publicOrderData);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
