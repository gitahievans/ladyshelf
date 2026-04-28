"use client";

import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import SectionHeader from "@/components/shared/SectionHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";

interface PasswordValues {
  password: string;
  confirmPassword: string;
}

type PasswordErrors = Partial<Record<keyof PasswordValues, string>>;

const formFieldClassName =
  "h-12 rounded-lg border-border-warm bg-ivory px-4 pr-12 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20";

const primaryButtonClassName =
  "h-12 rounded-lg bg-gold px-6 font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand";

function validatePassword(values: PasswordValues): PasswordErrors {
  const errors: PasswordErrors = {};

  if (!values.password.trim()) {
    errors.password = "Please enter your new password.";
  } else if (values.password.length < 8) {
    errors.password = "Your new password should be at least 8 characters.";
  }

  if (!values.confirmPassword.trim()) {
    errors.confirmPassword = "Please confirm your new password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Your passwords need to match.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }): ReactElement | null {
  if (!message) {
    return null;
  }

  return <p className="font-dm-sans text-caption text-error">{message}</p>;
}

export default function AccountSecurityPanel(): ReactElement {
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [values, setValues] = useState<PasswordValues>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState<boolean>(false);

  function updateField<K extends keyof PasswordValues>(
    key: K,
    value: PasswordValues[K],
  ): void {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const nextErrors = validatePassword(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      await updatePassword(values.password);
      setValues({ password: "", confirmPassword: "" });
      setSubmitError("");
      setSuccessMessage("Your password has been updated.");
    } catch (error) {
      setSuccessMessage("");
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We couldn't update your password right now.",
      );
    }
  }

  return (
    <section className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
      <SectionHeader
        label="Security"
        subtitle="For now, this update flow is intended for customers who sign in with email and password."
        title="Change your password"
      />

      <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="account-password">
            New Password
          </Label>
          <div className="relative">
            <Input
              className={formFieldClassName}
              id="account-password"
              onChange={(event): void => updateField("password", event.target.value)}
              type={isPasswordVisible ? "text" : "password"}
              value={values.password}
            />
            <button
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex h-full w-12 items-center justify-center text-text-muted hover:text-obsidian"
              onClick={(): void => setIsPasswordVisible((current) => !current)}
              type="button"
            >
              {isPasswordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <FieldError message={errors.password} />
        </div>

        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="account-confirm-password">
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              className={formFieldClassName}
              id="account-confirm-password"
              onChange={(event): void => updateField("confirmPassword", event.target.value)}
              type={isConfirmPasswordVisible ? "text" : "password"}
              value={values.confirmPassword}
            />
            <button
              aria-label={isConfirmPasswordVisible ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex h-full w-12 items-center justify-center text-text-muted hover:text-obsidian"
              onClick={(): void => setIsConfirmPasswordVisible((current) => !current)}
              type="button"
            >
              {isConfirmPasswordVisible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <FieldError message={errors.confirmPassword} />
        </div>

        {successMessage ? (
          <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 font-dm-sans text-body-sm text-success">
            {successMessage}
          </p>
        ) : null}

        {submitError ? (
          <p className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 font-dm-sans text-body-sm text-error">
            {submitError}
          </p>
        ) : null}

        <Button className={primaryButtonClassName} disabled={isLoading} type="submit">
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <LoadingSpinner className="border-t-obsidian" size="sm" />
              Updating password...
            </span>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>
    </section>
  );
}
