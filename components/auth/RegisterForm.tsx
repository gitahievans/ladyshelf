"use client";

import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

import AuthShell from "@/components/auth/AuthShell";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RegisterPayload } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";

interface RegisterValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;
type StrengthTone = "error" | "gold" | "success" | "border";

interface PasswordStrength {
  label: string;
  tone: StrengthTone;
  width: string;
}

const formFieldClassName =
  "h-12 rounded-lg border-border-warm bg-ivory px-4 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20";

const primaryButtonClassName =
  "h-12 w-full rounded-lg bg-gold font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand";

function validateRegister(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "Please add your first name.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Please add your last name.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter the email address for your account.";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Please enter your email in a valid format.";
  }

  if (!values.password.trim()) {
    errors.password = "Please choose a password.";
  }

  if (!values.confirmPassword.trim()) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Your passwords need to match.";
  }

  return errors;
}

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { label: "Add a password to begin.", tone: "border", width: "0%" };
  }

  const hasNumbers = /\d/.test(password);
  const hasLetters = /[A-Za-z]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);
  const characterGroups = [hasNumbers, hasLetters, hasSymbols].filter(Boolean).length;

  if (password.length > 10 && characterGroups >= 2) {
    return { label: "Strong", tone: "success", width: "100%" };
  }

  if ((password.length >= 6 && password.length <= 10) || hasNumbers) {
    return { label: "Medium", tone: "gold", width: "66%" };
  }

  return { label: "Weak", tone: "error", width: "33%" };
}

function FieldError({ message }: { message?: string }): ReactElement | null {
  if (!message) return null;

  return <p className="font-dm-sans text-caption text-error">{message}</p>;
}

function PasswordStrengthBar({
  password,
}: {
  password: string;
}): ReactElement {
  const shouldReduceMotion = useReducedMotion();
  const strength = getPasswordStrength(password);
  const toneClassName: Record<StrengthTone, string> = {
    border: "bg-border-warm",
    error: "bg-error",
    gold: "bg-gold",
    success: "bg-success",
  };
  const textClassName: Record<StrengthTone, string> = {
    border: "text-text-muted",
    error: "text-error",
    gold: "text-gold",
    success: "text-success",
  };

  return (
    <div className="space-y-2">
      <div className="h-1.5 overflow-hidden rounded-full bg-cream">
        <motion.div
          animate={{ width: strength.width }}
          className={`h-full rounded-full ${toneClassName[strength.tone]}`}
          initial={false}
          transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeOut" }}
        />
      </div>
      <p className={`font-dm-sans text-caption ${textClassName[strength.tone]}`}>
        {strength.label}
      </p>
    </div>
  );
}

export default function RegisterForm(): ReactElement {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [values, setValues] = useState<RegisterValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState<boolean>(false);

  function updateField<K extends keyof RegisterValues>(
    key: K,
    value: RegisterValues[K],
  ): void {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const nextErrors = validateRegister(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await register({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
      password: values.password,
    });

    router.push("/");
  }

  return (
    <AuthShell
      footer={
        <p className="font-dm-sans text-body-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            className="font-medium text-gold transition-colors hover:text-sand"
            href="/auth/login"
          >
            Welcome Back
          </Link>
        </p>
      }
      heading="Join Wahi"
      subheading="Create your account"
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              className="font-dm-sans text-body-sm text-obsidian"
              htmlFor="firstName"
            >
              First Name
            </Label>
            <Input
              className={formFieldClassName}
              id="firstName"
              onChange={(event): void => updateField("firstName", event.target.value)}
              placeholder="Amina"
              value={values.firstName}
            />
            <FieldError message={errors.firstName} />
          </div>

          <div className="space-y-2">
            <Label
              className="font-dm-sans text-body-sm text-obsidian"
              htmlFor="lastName"
            >
              Last Name
            </Label>
            <Input
              className={formFieldClassName}
              id="lastName"
              onChange={(event): void => updateField("lastName", event.target.value)}
              placeholder="Wanjiru"
              value={values.lastName}
            />
            <FieldError message={errors.lastName} />
          </div>
        </div>

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
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="phone">
            Phone
          </Label>
          <Input
            className={formFieldClassName}
            id="phone"
            onChange={(event): void => updateField("phone", event.target.value)}
            placeholder="+254 XXX XXX XXX"
            value={values.phone}
          />
          <FieldError message={errors.phone} />
        </div>

        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="password">
            Password
          </Label>
          <div className="relative">
            <Input
              className="h-12 rounded-lg border-border-warm bg-ivory px-4 pr-12 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20"
              id="password"
              onChange={(event): void => updateField("password", event.target.value)}
              placeholder="Create your password"
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
          <PasswordStrengthBar password={values.password} />
          <FieldError message={errors.password} />
        </div>

        <div className="space-y-2">
          <Label
            className="font-dm-sans text-body-sm text-obsidian"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              className="h-12 rounded-lg border-border-warm bg-ivory px-4 pr-12 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20"
              id="confirmPassword"
              onChange={(event): void =>
                updateField("confirmPassword", event.target.value)
              }
              placeholder="Confirm your password"
              type={isConfirmPasswordVisible ? "text" : "password"}
              value={values.confirmPassword}
            />
            <button
              aria-label={
                isConfirmPasswordVisible ? "Hide password" : "Show password"
              }
              className="absolute inset-y-0 right-0 flex h-full w-12 items-center justify-center text-text-muted hover:text-obsidian"
              onClick={(): void =>
                setIsConfirmPasswordVisible((current) => !current)
              }
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

        <div className="pt-2">
          <Button className={primaryButtonClassName} disabled={isLoading} type="submit">
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <LoadingSpinner className="border-t-obsidian" size="sm" />
                Preparing your account...
              </span>
            ) : (
              "Join Wahi"
            )}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
