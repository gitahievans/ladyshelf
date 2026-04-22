"use client";

import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthShell from "@/components/auth/AuthShell";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";

export default function UpdatePasswordForm(): ReactElement {
  const router = useRouter();
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Your passwords need to match.");
      return;
    }

    try {
      setError("");
      await updatePassword(password);
      setSuccess("Your password has been updated. You can now sign in.");
      setTimeout(() => {
        router.replace("/auth/login");
      }, 1200);
    } catch (submitError) {
      setSuccess("");
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We couldn't update your password right now.",
      );
    }
  }

  return (
    <AuthShell
      footer={
        <p className="font-dm-sans text-body-sm text-text-secondary">
          Return to{" "}
          <Link
            className="font-medium text-gold transition-colors hover:text-sand"
            href="/auth/login"
          >
            sign in
          </Link>
        </p>
      }
      heading="Choose a New Password"
      subheading="Create a fresh password for your Wahi account."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="password">
            New Password
          </Label>
          <Input
            className="h-12 rounded-lg border-border-warm bg-ivory px-4 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20"
            id="password"
            onChange={(event): void => setPassword(event.target.value)}
            placeholder="Create your new password"
            type="password"
            value={password}
          />
        </div>

        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="confirmPassword">
            Confirm Password
          </Label>
          <Input
            className="h-12 rounded-lg border-border-warm bg-ivory px-4 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20"
            id="confirmPassword"
            onChange={(event): void => setConfirmPassword(event.target.value)}
            placeholder="Confirm your new password"
            type="password"
            value={confirmPassword}
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
              Updating password...
            </span>
          ) : (
            "Save New Password"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
