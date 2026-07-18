"use client";

import type { FormEvent, ReactElement } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AuthShell from "@/components/auth/AuthShell";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import PhoneField from "@/components/shared/PhoneField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  type PhoneSelection,
  validateInternationalPhone,
  validateInternationalPhoneLive,
} from "@/lib/utils/phone";
import { useAuthStore } from "@/stores/authStore";

const formFieldClassName =
  "h-12 rounded-lg border-border-warm bg-ivory px-4 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20";

const primaryButtonClassName =
  "h-12 w-full rounded-lg bg-gold font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand";

function getSafeRedirectPath(nextPath: string | null): string {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/account";
  }

  return nextPath;
}

function validatePhone(
  phone: string,
  phoneCountry?: PhoneSelection,
): string | undefined {
  return validateInternationalPhone(phone, {
    required: true,
    requiredMessage: "Please add the phone number we should use for SMS updates.",
  }, phoneCountry);
}

function FieldError({ message }: { message?: string }): ReactElement | null {
  if (!message) {
    return null;
  }

  return <p className="font-dm-sans text-caption text-error">{message}</p>;
}

export default function CompleteProfileForm(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const updatePhone = useAuthStore((state) => state.updatePhone);
  const logout = useAuthStore((state) => state.logout);

  const [phone, setPhone] = useState<string>("");
  const [phoneCountry, setPhoneCountry] = useState<PhoneSelection | undefined>(
    undefined,
  );
  const [fieldError, setFieldError] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");

  const nextPath = getSafeRedirectPath(searchParams.get("next"));

  useEffect((): void => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    if (user?.phone?.trim()) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, isInitialized, nextPath, router, user]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const nextError = validatePhone(phone, phoneCountry);

    if (nextError) {
      setFieldError(nextError);
      return;
    }

    try {
      setFieldError("");
      setSubmitError("");
      await updatePhone(phone.trim());
      router.replace(nextPath);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We couldn't complete your account right now.",
      );
    }
  }

  async function handleSignOut(): Promise<void> {
    await logout();
    router.replace("/auth/login");
  }

  if (!isInitialized) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-cream px-4 py-8">
        <LoadingSpinner size="lg" />
      </section>
    );
  }

  return (
    <AuthShell
      footer={
        <button
          className="font-dm-sans text-body-sm text-text-secondary transition-colors hover:text-obsidian"
          onClick={(): void => {
            void handleSignOut();
          }}
          type="button"
        >
          Use a different account
        </button>
      }
      heading="Complete Your Account"
      subheading="Add the phone number we will use for delivery coordination and SMS updates."
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <div className="rounded-lg border border-border-warm bg-cream px-4 py-4">
          <p className="font-dm-sans text-label uppercase tracking-[0.16em] text-gold">
            One Last Step
          </p>
          <p className="mt-2 font-dm-sans text-body-sm text-text-secondary">
            Please provide use with your phone number before your Lady Shelf account
            is fully ready.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            className="font-dm-sans text-body-sm text-obsidian"
            htmlFor="phone"
          >
            Phone Number
          </Label>
          <PhoneField
            error={fieldError}
            id="phone"
            onChange={(value, nextPhoneCountry): void => {
              setPhone(value);
              setPhoneCountry(nextPhoneCountry);
              setFieldError(
                validateInternationalPhoneLive(value, nextPhoneCountry) ?? "",
              );
              setSubmitError("");
            }}
            value={phone}
          />
        </div>

        {submitError ? (
          <p className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 font-dm-sans text-body-sm text-error">
            {submitError}
          </p>
        ) : null}

        <Button
          className={primaryButtonClassName}
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <LoadingSpinner className="border-t-obsidian" size="sm" />
              Saving your phone number...
            </span>
          ) : (
            "Save and Continue"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
