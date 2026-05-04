import { NextRequest, NextResponse } from "next/server";
import { getProducts, saveProduct } from "@/lib/db";
import { generateId, slugify } from "@/lib/utils";
import { Product } from "@/types/product";

export async function GET() {
  try {
    const products = getProducts();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, category, description, dosageInfo, usage, composition, sideEffects, price, stock, images, tags } = body;

    if (!name || !category || !description || !price) {
      return NextResponse.json(
        { error: "Missing required fields: name, category, description, price" },
        { status: 400 }
      );
    }

    const product: Product = {
      subcategory: body.subcategory || "",
      manufacturer: body.manufacturer || "",
      prescriptionRequired: body.prescriptionRequired || false,
      form: body.form || "",
      id: `prod_${generateId()}`,
      name,
      slug: slugify(name),
      category,
      description,
      dosageInfo: dosageInfo || "",
      usage: usage || "",
      composition: composition || "",
      sideEffects: sideEffects || "",
      price: Number(price),
      stock: Number(stock) || 0,
      images: images || [`https://placehold.co/400x400/0B1F3A/C9963E?text=${encodeURIComponent(name)}`],
      rating: 0,
      reviewCount: 0,
      isActive: true,
      tags: tags || [],
    };

    saveProduct(product);

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
