import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { updateCategory, getProducts } from "@/lib/db";
import { Category } from "@/types/product";
import fs from "fs";
import path from "path";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return token ? await verifyToken(token) : false;
}

// PATCH /api/admin/categories/[id] — update any field
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = await request.json();
    const updated = updateCategory(id, body);
    if (!updated) return NextResponse.json({ message: "Category not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Failed to update category" }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] — delete if no products use it
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const filePath = path.join(process.cwd(), "data/categories.json");
    const all = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Category[];
    const cat = all.find((c) => c.id === id);
    if (!cat) return NextResponse.json({ message: "Category not found" }, { status: 404 });

    // Check if any product uses this category
    const products = getProducts();
    const inUse = products.some((p) => p.category === cat.name);
    if (inUse) {
      return NextResponse.json({ message: "Cannot delete — category has active products" }, { status: 400 });
    }

    const filtered = all.filter((c) => c.id !== id);
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Failed to delete category" }, { status: 500 });
  }
}
