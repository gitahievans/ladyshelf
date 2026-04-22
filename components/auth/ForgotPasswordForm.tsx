"use client";

import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import Link from "next/link";

import AuthShell from "@/components/auth/AuthShell";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";

export default function ForgotPasswordForm(): ReactElement {
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    try {
      setError("");
      await requestPasswordReset(email.trim());
      setSuccess("We have sent your password reset link. Please check your email.");
    } catch (submitError) {
      setSuccess("");
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We couldn't send the reset link right now.",
      );
    }
  }

  return (
    <AuthShell
      footer={
        <p className="font-dm-sans text-body-sm text-text-secondary">
          Back to{" "}
          <Link
            className="font-medium text-gold transition-colors hover:text-sand"
            href="/auth/login"
          >
            sign in
          </Link>
        </p>
      }
      heading="Reset Password"
      subheading="We&apos;ll send you a secure link to choose a new password."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="email">
            Email
          </Label>
          <Input
            className="h-12 rounded-lg border-border-warm bg-ivory px-4 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20"
            id="email"
            onChange={(event): void => setEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
        </div>

        {success ? (
          <p className="rounded-lg border border-success/20 bg-success/10 px-4 py-3 font-dm-sans text-body-sm text-success">
            {success}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 font-dm-sans text-body-sm text-error">
            {error}
          </p>
        ) : null}

        <Button
          className="h-12 w-full rounded-lg bg-gold font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <LoadingSpinner className="border-t-obsidian" size="sm" />
              Sending reset link...
            </span>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
