export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
  manufacturer: string | null;
  prescriptionRequired: boolean;
  form: string | null;
  description: string;
  dosageInfo: string;
  usage: string;
  composition: string;
  sideEffects: string;
  price: number;
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  isPublic: boolean;
  subcategories: string[];
}
