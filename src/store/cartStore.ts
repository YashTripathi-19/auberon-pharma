"use client";
import { create } from "zustand";

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  stock?: number; // current stock cap
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  onCapExceeded?: (productName: string, cap: number) => void;
  setCapCallback: (fn: (productName: string, cap: number) => void) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  onCapExceeded: undefined,
  setCapCallback: (fn) => set({ onCapExceeded: fn }),

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);
      const stock = item.stock ?? Infinity;

      if (existing) {
        const newQty = existing.quantity + 1;
        if (newQty > stock) {
          state.onCapExceeded?.(item.productName, stock);
          return state; // don't update
        }
        return {
          items: state.items.map((i) =>
            i.productId === item.productId ? { ...i, quantity: newQty, stock: item.stock ?? i.stock } : i
          ),
        };
      }
      const qty = Math.min(1, stock);
      return { items: [...state.items, { ...item, quantity: qty }] };
    }),

  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      const item = state.items.find((i) => i.productId === productId);
      const stock = item?.stock ?? Infinity;
      const capped = Math.min(quantity, stock);
      if (capped !== quantity && item) {
        state.onCapExceeded?.(item.productName, stock);
      }
      return {
        items:
          capped <= 0
            ? state.items.filter((i) => i.productId !== productId)
            : state.items.map((i) => i.productId === productId ? { ...i, quantity: capped } : i),
      };
    }),

  clearCart: () => set({ items: [] }),
  getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
