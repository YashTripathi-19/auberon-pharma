"use client";
import { create } from "zustand";

interface AnalyticsStore {
  dateRange: "7" | "30" | "90";
  setDateRange: (range: "7" | "30" | "90") => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  dateRange: "7",
  setDateRange: (dateRange) => set({ dateRange }),
}));
