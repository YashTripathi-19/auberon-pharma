import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";

const dataDir = path.join(process.cwd(), "data");

interface Partner {
  id: string;
  name: string;
  category: string;
  description: string;
  website: string;
  logo: string;
  active: boolean;
  createdAt: string;
}

function readPartners(): Partner[] {
  const filePath = path.join(dataDir, "partners.json");
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as Partner[];
  } catch {
    return [];
  }
}

function writePartners(partners: Partner[]): void {
  const filePath = path.join(dataDir, "partners.json");
  fs.writeFileSync(filePath, JSON.stringify(partners, null, 2), "utf-8");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    // Admin JWT auth check
    const token = await getTokenFromCookies();
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const partners = readPartners();
    const index = partners.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    // Merge fields
    partners[index] = {
      ...partners[index],
      ...body,
      id: partners[index].id, // Preserve id
      createdAt: partners[index].createdAt, // Preserve createdAt
    };

    writePartners(partners);

    return NextResponse.json(partners[index]);
  } catch (error) {
    console.error("Failed to update partner:", error);
    return NextResponse.json(
      { error: "Failed to update partner" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    // Admin JWT auth check
    const token = await getTokenFromCookies();
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partners = readPartners();
    const filtered = partners.filter((p) => p.id !== id);

    if (filtered.length === partners.length) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    writePartners(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete partner:", error);
    return NextResponse.json(
      { error: "Failed to delete partner" },
      { status: 500 }
    );
  }
}
