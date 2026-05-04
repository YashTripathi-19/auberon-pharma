"use client";
import { create } from "zustand";

interface FilterStore {
  category: string;
  minRating: number;
  priceRange: [number, number];
  searchQuery: string;
  setCategory: (category: string) => void;
  setMinRating: (rating: number) => void;
  setPriceRange: (range: [number, number]) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  category: "All",
  minRating: 0,
  priceRange: [0, 1000],
  searchQuery: "",
  setCategory: (category) => set({ category }),
  setMinRating: (minRating) => set({ minRating }),
  setPriceRange: (priceRange) => set({ priceRange }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  resetFilters: () =>
    set({
      category: "All",
      minRating: 0,
      priceRange: [0, 1000],
      searchQuery: "",
    }),
}));
