"use client";

import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import AuthShell from "@/components/auth/AuthShell";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";

interface LoginValues {
  email: string;
  password: string;
}

type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const formFieldClassName =
  "h-12 rounded-lg border-border-warm bg-ivory px-4 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20";

const primaryButtonClassName =
  "h-12 w-full rounded-lg bg-gold font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand";

const ghostButtonClassName =
  "h-12 w-full rounded-lg border border-border-warm bg-transparent font-dm-sans text-body-sm font-medium text-obsidian hover:border-gold hover:bg-cream";

function validateLogin(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {};

  if (!values.email.trim()) {
    errors.email = "Please enter the email address linked to your account.";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Please enter your email in a valid format.";
  }

  if (!values.password.trim()) {
    errors.password = "Please enter your password.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }): ReactElement | null {
  if (!message) return null;

  return <p className="font-dm-sans text-caption text-error">{message}</p>;
}

export default function LoginForm(): ReactElement {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [values, setValues] = useState<LoginValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");

  function updateField<K extends keyof LoginValues>(
    key: K,
    value: LoginValues[K],
  ): void {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const nextErrors = validateLogin(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setSubmitError("");
      await login(values.email, values.password);
      router.push("/");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We couldn't find that account. Please check your details.",
      );
    }
  }

  async function handleGoogleSignIn(): Promise<void> {
    try {
      setSubmitError("");
      await loginWithGoogle();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Google sign-in is unavailable right now.",
      );
    }
  }

  return (
    <AuthShell
      footer={
        <p className="font-dm-sans text-body-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            className="font-medium text-gold transition-colors hover:text-sand"
            href="/auth/register"
          >
            Join Lady Shelf
          </Link>
        </p>
      }
      heading="Welcome Back"
      subheading="Sign in to your account"
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="email">
            Email
          </Label>
          <Input
            className={formFieldClassName}
            id="email"
            onChange={(event): void => updateField("email", event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={values.email}
          />
          <FieldError message={errors.email} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label
              className="font-dm-sans text-body-sm text-obsidian"
              htmlFor="password"
            >
              Password
            </Label>
            <Link
              className="font-dm-sans text-caption font-medium text-gold transition-colors hover:text-sand"
              href="/auth/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              className="h-12 rounded-lg border-border-warm bg-ivory px-4 pr-12 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20"
              id="password"
              onChange={(event): void => updateField("password", event.target.value)}
              placeholder="Enter your password"
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

        {submitError ? (
          <p className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 font-dm-sans text-body-sm text-error">
            {submitError}
          </p>
        ) : null}

        <div className="space-y-4 pt-2">
          <Button className={primaryButtonClassName} disabled={isLoading} type="submit">
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <LoadingSpinner className="border-t-obsidian" size="sm" />
                Curating your entrance...
              </span>
            ) : (
              "Welcome Back"
            )}
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border-warm" />
            <span className="font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
              or
            </span>
            <div className="h-px flex-1 bg-border-warm" />
          </div>

          <Button
            className={ghostButtonClassName}
            disabled={isLoading}
            onClick={(): void => {
              void handleGoogleSignIn();
            }}
            type="button"
            variant="ghost"
          >
            <span className="flex items-center justify-center gap-3">
              <span className="text-base font-semibold">G</span>
              Continue with Google
            </span>
          </Button>

          <Button asChild className={ghostButtonClassName} variant="ghost">
            <Link href="/checkout">Continue as Guest</Link>
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
