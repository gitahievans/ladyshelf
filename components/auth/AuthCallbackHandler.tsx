"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { fetchCurrentUserFromSession } from "@/lib/api/account";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

export default function AuthCallbackHandler(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialize = useAuthStore((state) => state.initialize);
  const [error, setError] = useState<string>("");
  const supabase = createClient();

  useEffect((): void => {
    async function handleCallback(): Promise<void> {
      try {
        const code = searchParams.get("code");
        const next = searchParams.get("next");
        const type = searchParams.get("type");

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }
        }

        const user = await fetchCurrentUserFromSession();

        await initialize();

        if (type === "recovery" || next === "/auth/update-password") {
          router.replace("/auth/update-password");
          return;
        }

        if (user) {
          router.replace("/account");
          return;
        }

        throw new Error(
          "Your sign-in was accepted, but we couldn't load your account details yet.",
        );
      } catch (callbackError) {
        setError(
          callbackError instanceof Error
            ? callbackError.message
            : "We couldn't complete your sign-in.",
        );
      }
    }

    void handleCallback();
  }, [initialize, router, searchParams, supabase]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-md rounded-lg border border-border-warm bg-ivory p-8 text-center shadow-card">
        {error ? (
          <p className="font-dm-sans text-body-sm text-error">{error}</p>
        ) : (
          <div className="space-y-4">
            <LoadingSpinner className="mx-auto border-t-obsidian" size="lg" />
            <p className="font-dm-sans text-body-sm text-text-secondary">
              Completing your secure sign-in...
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
