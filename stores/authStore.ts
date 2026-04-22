"use client";

import { create } from "zustand";

import type { AuthStore, RegisterPayload, User } from "@/lib/types";
import { fetchCurrentUser, fetchCurrentUserFromSession } from "@/lib/api/account";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_REDIRECT_PATH = "/auth/callback";
const supabase = createClient();

function getRedirectUrl(path: string = DEFAULT_REDIRECT_PATH): string {
  if (typeof window === "undefined") {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}

async function resolveUser(): Promise<User | null> {
  return fetchCurrentUserFromSession();
}

function normalizeAuthError(error: unknown): Error {
  if (!(error instanceof Error)) {
    return new Error("Something went wrong. Please try again.");
  }

  if (error.message === "Invalid login credentials") {
    return new Error(
      "We couldn't sign you in with that email and password. If you don't have an account yet, please create one first.",
    );
  }

  return error;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  initialize: async (): Promise<void> => {
    try {
      const user = await resolveUser();

      set({
        user,
        isAuthenticated: Boolean(user),
        isInitialized: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
      });
    }
  },
  login: async (email, password): Promise<void> => {
    set({ isLoading: true });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false });
      throw normalizeAuthError(error);
    }

    const user = await resolveUser();
    set({
      user,
      isAuthenticated: Boolean(user),
      isInitialized: true,
      isLoading: false,
    });
  },
  loginWithGoogle: async (): Promise<void> => {
    set({ isLoading: true });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getRedirectUrl(),
      },
    });

    if (error) {
      set({ isLoading: false });
      throw normalizeAuthError(error);
    }
  },
  logout: async (): Promise<void> => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
    });
  },
  register: async (data): Promise<{ emailConfirmationRequired: boolean }> => {
    set({ isLoading: true });

    const { data: response, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
        },
        emailRedirectTo: getRedirectUrl(),
      },
    });

    if (error) {
      set({ isLoading: false });
      throw normalizeAuthError(error);
    }

    const emailConfirmationRequired = !response.session;
    const user = response.session?.access_token
      ? await fetchCurrentUser(response.session.access_token)
      : null;

    set({
      user,
      isAuthenticated: Boolean(user),
      isInitialized: true,
      isLoading: false,
    });

    return { emailConfirmationRequired };
  },
  requestPasswordReset: async (email: string): Promise<void> => {
    set({ isLoading: true });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getRedirectUrl("/auth/callback?next=/auth/update-password&type=recovery"),
    });

    set({ isLoading: false });

    if (error) {
      throw normalizeAuthError(error);
    }
  },
  updatePassword: async (password: string): Promise<void> => {
    set({ isLoading: true });
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      set({ isLoading: false });
      throw normalizeAuthError(error);
    }

    const user = await resolveUser();
    set({
      user,
      isAuthenticated: Boolean(user),
      isInitialized: true,
      isLoading: false,
    });
  },
}));
