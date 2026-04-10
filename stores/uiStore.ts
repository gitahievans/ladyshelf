"use client";

import { create } from "zustand";

import type { FilterState, UIStore } from "@/lib/types";

const defaultFilters: FilterState = {
  sizes: [],
  colors: [],
  priceRange: [1800, 12500],
  badges: [],
  inStockOnly: false,
};

export const useUIStore = create<UIStore>()((set) => ({
  selectedCategory: "all",
  sortBy: "newest",
  viewMode: "grid",
  filters: defaultFilters,
  setCategory: (category): void => set({ selectedCategory: category }),
  setSortBy: (sortBy): void => set({ sortBy }),
  setViewMode: (viewMode): void => set({ viewMode }),
  setFilters: (filters): void =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    })),
  resetFilters: (): void =>
    set({
      selectedCategory: "all",
      filters: defaultFilters,
    }),
}));
