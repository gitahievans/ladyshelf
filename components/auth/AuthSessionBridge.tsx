"use client";

import type { ReactElement } from "react";
import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";

export default function AuthSessionBridge(): ReactElement | null {
  const initialize = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const syncWishlist = useWishlistStore((state) => state.syncWishlist);
  const supabase = createClient();

  useEffect((): (() => void) => {
    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void initialize();
    });

    return (): void => {
      subscription.unsubscribe();
    };
  }, [initialize]);

  useEffect((): void => {
    if (!isInitialized) {
      return;
    }

    void syncWishlist({ mergeLocal: isAuthenticated });
  }, [isAuthenticated, isInitialized, syncWishlist]);

  return null;
}
