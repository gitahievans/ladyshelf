"use client";

import type { ReactElement } from "react";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";

const COMPLETE_PROFILE_PATH = "/auth/complete-profile";

function getSafeNextPath(pathname: string, searchParams: URLSearchParams): string {
  const nextPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/account";
  }

  return nextPath;
}

export default function AuthSessionBridge(): ReactElement | null {
  const initialize = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const user = useAuthStore((state) => state.user);
  const syncWishlist = useWishlistStore((state) => state.syncWishlist);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
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

  useEffect((): void => {
    if (!isInitialized || !isAuthenticated || !user) {
      return;
    }

    if (user.phone?.trim()) {
      return;
    }

    if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) {
      return;
    }

    const params = new URLSearchParams();
    params.set("next", getSafeNextPath(pathname, new URLSearchParams(searchParams.toString())));
    router.replace(`${COMPLETE_PROFILE_PATH}?${params.toString()}`);
  }, [isAuthenticated, isInitialized, pathname, router, searchParams, user]);

  return null;
}
