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

export async function GET(request: NextRequest) {
  try {
    // Admin JWT auth check
    const token = await getTokenFromCookies();
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partners = readPartners();
    return NextResponse.json(partners);
  } catch (error) {
    console.error("Failed to fetch partners:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin JWT auth check
    const token = await getTokenFromCookies();
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, description, website, logo, active } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "name and category are required" },
        { status: 400 }
      );
    }

    const partners = readPartners();

    const newPartner: Partner = {
      id: `partner_${Date.now()}`,
      name,
      category,
      description: description || "",
      website: website || "",
      logo: logo || "",
      active: active !== undefined ? active : true,
      createdAt: new Date().toISOString(),
    };

    partners.push(newPartner);
    writePartners(partners);

    return NextResponse.json(newPartner, { status: 201 });
  } catch (error) {
    console.error("Failed to create partner:", error);
    return NextResponse.json(
      { error: "Failed to create partner" },
      { status: 500 }
    );
  }
}
