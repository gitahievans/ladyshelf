"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItem, CartStore } from "@/lib/types";
import { clampCartItemQuantity } from "@/lib/utils/cartStock";

interface CartStateSlice {
  items: CartItem[];
  isOpen: boolean;
}

function sanitizeCartItems(items: CartItem[]): CartItem[] {
  return items
    .map((item) => clampCartItemQuantity(item))
    .filter((item): item is CartItem => item !== null && item.quantity > 0);
}

function calculateCartTotals(items: CartItem[]): Pick<CartStore, "subtotal" | "totalItems"> {
  const totalItems = items.reduce(
    (count, item) => count + item.quantity,
    0,
  );
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return { totalItems, subtotal };
}

function buildCartState(items: CartItem[], isOpen: boolean): CartStateSlice & Pick<CartStore, "subtotal" | "totalItems"> {
  const sanitizedItems = sanitizeCartItems(items);

  return {
    items: sanitizedItems,
    isOpen,
    ...calculateCartTotals(sanitizedItems),
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      ...buildCartState([], false),
      addItem: (item): void => {
        set((state) => {
          const existingItem = state.items.find(
            (cartItem) => cartItem.variantId === item.variantId,
          );

          const nextItems = existingItem
            ? state.items.map((cartItem) =>
                cartItem.variantId === item.variantId
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem,
              )
            : [...state.items, item];

          return buildCartState(nextItems, state.isOpen);
        });
      },
      removeItem: (cartItemId): void => {
        set((state) =>
          buildCartState(
            state.items.filter((item) => item.id !== cartItemId),
            state.isOpen,
          ),
        );
      },
      updateQuantity: (cartItemId, quantity): void => {
        set((state) => {
          const nextItems = state.items
            .map((item) =>
              item.id === cartItemId ? { ...item, quantity } : item,
            )
            .filter((item) => item.quantity > 0);

          return buildCartState(nextItems, state.isOpen);
        });
      },
      clearCart: (): void => {
        set(() => buildCartState([], false));
      },
      toggleCart: (): void => {
        set((state) => buildCartState(state.items, !state.isOpen));
      },
    }),
    {
      name: "wahi-cart-store",
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const typedState = persistedState as Partial<CartStore> | undefined;

        return {
          ...currentState,
          ...typedState,
          ...buildCartState(
            typedState?.items ?? currentState.items,
            typedState?.isOpen ?? currentState.isOpen,
          ),
        };
      },
      partialize: (state) => ({
        items: state.items,
        isOpen: state.isOpen,
        subtotal: state.subtotal,
        totalItems: state.totalItems,
      }),
    },
  ),
);
