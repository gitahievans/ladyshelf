"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { WishlistStore } from "@/lib/types";

function buildWishlistState(productIds: string[]): Pick<WishlistStore, "productIds" | "count"> {
  return {
    productIds,
    count: productIds.length,
  };
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ...buildWishlistState([]),
      addItem: (productId): void => {
        set((state) => {
          if (state.productIds.includes(productId)) {
            return state;
          }

          return {
            ...state,
            ...buildWishlistState([...state.productIds, productId]),
          };
        });
      },
      removeItem: (productId): void => {
        set((state) => ({
          ...state,
          ...buildWishlistState(
            state.productIds.filter((savedProductId) => savedProductId !== productId),
          ),
        }));
      },
      toggleItem: (productId): void => {
        const hasItem = get().productIds.includes(productId);

        if (hasItem) {
          get().removeItem(productId);
          return;
        }

        get().addItem(productId);
      },
      hasItem: (productId): boolean => get().productIds.includes(productId),
      clearWishlist: (): void => {
        set((state) => ({
          ...state,
          ...buildWishlistState([]),
        }));
      },
    }),
    {
      name: "wahi-wishlist-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => buildWishlistState(state.productIds),
    },
  ),
);
