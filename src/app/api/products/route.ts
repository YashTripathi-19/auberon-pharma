import { NextRequest, NextResponse } from "next/server";
import { getProducts, getAllCategories } from "@/lib/db";

// GET /api/products — public route
// Supports: ?category=, ?subcategory=, ?form=, ?prescriptionRequired=, ?search=
// Only returns products from public categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const form = searchParams.get("form");
    const prescriptionRequired = searchParams.get("prescriptionRequired");
    const search = searchParams.get("search");

    // Get public category names
    const allCategories = getAllCategories();
    const publicCategoryNames = allCategories
      .filter((c) => c.isPublic && c.isActive)
      .map((c) => c.name.toLowerCase());

    let products = getProducts().filter((p) =>
      p.isActive && publicCategoryNames.includes(p.category.toLowerCase())
    );

    if (category) {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (subcategory) {
      products = products.filter((p) => p.subcategory?.toLowerCase() === subcategory.toLowerCase());
    }

    if (form) {
      products = products.filter((p) => p.form?.toLowerCase() === form.toLowerCase());
    }

    if (prescriptionRequired !== null) {
      const required = prescriptionRequired === "true";
      products = products.filter((p) => p.prescriptionRequired === required);
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subcategory?.toLowerCase().includes(q)) ||
        (p.tags?.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}
