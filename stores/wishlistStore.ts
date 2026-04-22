"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  addWishlistItem,
  clearWishlistItems,
  fetchWishlistProductIds,
  removeWishlistItem,
} from "@/lib/api/wishlist";
import type { WishlistStore } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";

function buildWishlistState(
  productIds: string[],
): Pick<WishlistStore, "productIds" | "count"> {
  return {
    productIds,
    count: productIds.length,
  };
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ...buildWishlistState([]),
      isLoaded: false,
      setProductIds: (productIds): void => {
        set((state) => ({
          ...state,
          ...buildWishlistState(productIds),
          isLoaded: true,
        }));
      },
      addItem: async (productId): Promise<void> => {
        set((state) => {
          if (state.productIds.includes(productId)) {
            return state;
          }

          return {
            ...state,
            ...buildWishlistState([...state.productIds, productId]),
          };
        });

        if (useAuthStore.getState().isAuthenticated) {
          try {
            await addWishlistItem(productId);
          } catch {
            await get().syncWishlist();
          }
        }
      },
      removeItem: async (productId): Promise<void> => {
        set((state) => ({
          ...state,
          ...buildWishlistState(
            state.productIds.filter((savedProductId) => savedProductId !== productId),
          ),
        }));

        if (useAuthStore.getState().isAuthenticated) {
          try {
            await removeWishlistItem(productId);
          } catch {
            await get().syncWishlist();
          }
        }
      },
      toggleItem: async (productId): Promise<void> => {
        const hasItem = get().productIds.includes(productId);

        if (hasItem) {
          await get().removeItem(productId);
          return;
        }

        await get().addItem(productId);
      },
      hasItem: (productId): boolean => get().productIds.includes(productId),
      clearWishlist: async (): Promise<void> => {
        set((state) => ({
          ...state,
          ...buildWishlistState([]),
        }));

        if (useAuthStore.getState().isAuthenticated) {
          try {
            await clearWishlistItems();
          } catch {
            await get().syncWishlist();
          }
        }
      },
      syncWishlist: async (options): Promise<void> => {
        if (!useAuthStore.getState().isAuthenticated) {
          set((state) => ({
            ...state,
            isLoaded: true,
          }));
          return;
        }

        const currentIds = get().productIds;
        const mergeLocal = options?.mergeLocal ?? false;

        try {
          if (mergeLocal && currentIds.length > 0) {
            const remoteIds = await fetchWishlistProductIds();
            const missingIds = currentIds.filter(
              (productId) => !remoteIds.includes(productId),
            );

            await Promise.all(
              missingIds.map(async (productId) => addWishlistItem(productId)),
            );
          }

          const productIds = await fetchWishlistProductIds();
          set((state) => ({
            ...state,
            ...buildWishlistState(productIds),
            isLoaded: true,
          }));
        } catch {
          set((state) => ({
            ...state,
            isLoaded: true,
          }));
        }
      },
    }),
    {
      name: "wahi-wishlist-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ...buildWishlistState(state.productIds),
      }),
    },
  ),
);
