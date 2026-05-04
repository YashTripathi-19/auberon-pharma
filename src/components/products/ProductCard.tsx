"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import ProductModal from "@/components/products/ProductModal";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { formatCurrency } from "@/lib/utils";
import { Eye, ShoppingBag, Heart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  wishlist?: string[];
  onWishlistToggle?: (productId: string, added: boolean) => void;
}

export default function ProductCard({ product, wishlist = [], onWishlistToggle }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [wishlisted, setWishlisted] = useState(wishlist.includes(product.id));
  const [toggling, setToggling] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  const handleBook = () => {
    addItem({ productId: product.id, productName: product.name, price: product.price, image: product.images[0] });
    router.push("/shop");
  };

  const handleWishlist = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const res = await fetch("/api/auth/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.status === 401) {
        addToast("info", "Sign in to save products to your wishlist");
        router.push("/login");
        return;
      }
      const data = await res.json();
      setWishlisted(data.added);
      onWishlistToggle?.(product.id, data.added);
      addToast("success", data.added ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      addToast("error", "Failed to update wishlist");
    } finally {
      setToggling(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">

        {/* Image area */}
        <div className="bg-[#F5F5F7] flex items-center justify-center relative" style={{ height: "140px", padding: "1.5rem" }}>
          <p className="font-display font-semibold text-primary/20 text-center leading-snug" style={{ fontSize: "0.95rem" }}>
            {product.name}
          </p>
          <div style={{ position: "absolute", top: "14px", left: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, padding: "4px 12px", background: "rgba(201,150,62,0.12)", color: "#C9963E", letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: "999px" }}>
              {product.category}
            </span>
          </div>
          {product.stock === 0 ? (
            <span className="absolute rounded-full" style={{ top: "14px", right: "14px", fontSize: "10px", fontWeight: 600, padding: "4px 12px", background: "#fef2f2", color: "#ef4444" }}>Out of stock</span>
          ) : product.stock < 20 ? (
            <span className="absolute rounded-full" style={{ top: "14px", right: "14px", fontSize: "10px", fontWeight: 600, padding: "4px 12px", background: "#fef2f2", color: "#ef4444" }}>Low stock</span>
          ) : null}
          {/* Wishlist button */}
          <button onClick={handleWishlist} disabled={toggling}
            style={{ position: "absolute", bottom: "10px", right: "10px", width: "32px", height: "32px", borderRadius: "50%", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "all 0.15s" }}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
            <Heart size={14} fill={wishlisted ? "#c9933a" : "none"} stroke={wishlisted ? "#c9933a" : "#9CA3AF"} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1" style={{ padding: "1.5rem" }}>
          <h3 className="font-display font-semibold text-primary leading-snug" style={{ fontSize: "1.05rem", marginBottom: "0.375rem" }}>
            {product.name}
          </h3>
          {product.form && (
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "0.5rem" }}>{product.form}</p>
          )}
          <p className="text-muted flex-1" style={{ fontSize: "13px", lineHeight: "1.75", marginBottom: "1.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {product.description}
          </p>

          <div className="flex items-center justify-between" style={{ paddingTop: "1.25rem", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
            <span className="font-numeric font-bold text-primary" style={{ fontSize: "1.3rem" }}>
              {formatCurrency(product.price)}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button onClick={() => setShowModal(true)}
                className="flex items-center justify-center rounded-full border border-black/[0.08] text-muted hover:text-primary hover:border-primary/20 transition-all"
                style={{ width: "38px", height: "38px" }} aria-label={`View details for ${product.name}`}>
                <Eye size={15} strokeWidth={1.5} />
              </button>
              <button onClick={handleBook} disabled={product.stock === 0}
                className="btn-primary btn-gold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ gap: "7px", padding: "9px 20px", fontSize: "13px" }} aria-label={`Book ${product.name}`}>
                <ShoppingBag size={13} strokeWidth={1.5} />
                {product.stock === 0 ? "Out of stock" : "Book"}
              </button>
            </div>
          </div>
          {product.manufacturer && (
            <p style={{ fontSize: "11px", color: "#C0C0C0", marginTop: "10px" }}>By {product.manufacturer}</p>
          )}
        </div>
      </div>

      <ProductModal product={product} isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
