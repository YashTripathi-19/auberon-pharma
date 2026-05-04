import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

export async function GET(request: NextRequest) {
  try {
    const partners = readPartners();
    
    // Return only active partners
    const activePartners = partners.filter((p) => p.active);
    
    return NextResponse.json(activePartners);
  } catch (error) {
    console.error("Failed to fetch partners:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}
