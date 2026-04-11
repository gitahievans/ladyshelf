"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mockUsers } from "@/lib/mock/users-orders";
import type { AuthStore, RegisterPayload, User } from "@/lib/types";

const MOCK_ERROR_EMAIL = "error@test.com";

function delay(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

function createTemporaryUser(data: RegisterPayload): User {
  return {
    id: `temp-user-${Date.now()}`,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    addresses: [],
    createdAt: new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email, password): Promise<void> => {
        void email;
        void password;
        set({ isLoading: true });
        await delay(800);

        if (email.toLowerCase() === MOCK_ERROR_EMAIL) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          throw new Error("Mock authentication failed.");
        }

        set({
          user: mockUsers[0] ?? null,
          isAuthenticated: true,
          isLoading: false,
        });
      },
      logout: (): void => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      register: async (data): Promise<void> => {
        set({ isLoading: true });
        await delay(800);
        set({
          user: createTemporaryUser(data),
          isAuthenticated: true,
          isLoading: false,
        });
      },
    }),
    {
      name: "wahi-auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const isTemporaryUser = state.user?.id.startsWith("temp-user-") ?? false;

        if (isTemporaryUser) {
          return {
            user: null,
            isAuthenticated: false,
          };
        }

        return {
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        };
      },
    },
  ),
);
