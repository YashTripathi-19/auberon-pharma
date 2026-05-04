import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getAllCategories, updateCategory } from "@/lib/db";
import { Category } from "@/types/product";
import fs from "fs";
import path from "path";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return token ? await verifyToken(token) : false;
}

// GET /api/admin/categories — returns ALL categories
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    return NextResponse.json(getAllCategories());
  } catch {
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/admin/categories — creates new category
export async function POST(request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = await request.json();
    const { name, description, icon, subcategories, isActive = true, isPublic = false } = body;
    if (!name || !description || !icon) {
      return NextResponse.json({ message: "name, description, and icon are required" }, { status: 400 });
    }
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const newCategory: Category = {
      id,
      name,
      description,
      icon,
      isActive,
      isPublic,
      subcategories: subcategories || [],
    };
    const filePath = path.join(process.cwd(), "data/categories.json");
    const all = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Category[];
    all.push(newCategory);
    fs.writeFileSync(filePath, JSON.stringify(all, null, 2));
    return NextResponse.json(newCategory, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to create category" }, { status: 500 });
  }
}
