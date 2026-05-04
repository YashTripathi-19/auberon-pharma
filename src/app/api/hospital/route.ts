import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data/hospital.json"), "utf-8"));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to load hospital data" }, { status: 500 });
  }
}
