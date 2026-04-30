"use client";

import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, MailCheck } from "lucide-react";

import AuthShell from "@/components/auth/AuthShell";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import PhoneField from "@/components/shared/PhoneField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type PhoneSelection,
  validateInternationalPhone,
  validateInternationalPhoneLive,
} from "@/lib/utils/phone";
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

const initialRegisterValues: RegisterValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

function validateRegister(
  values: RegisterValues,
  phoneCountry?: PhoneSelection,
): RegisterErrors {
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

  if (values.phone.trim()) {
    const phoneError = validateInternationalPhone(values.phone, {}, phoneCountry);

    if (phoneError) {
      errors.phone = phoneError;
    }
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
  const characterGroups = [hasNumbers, hasLetters, hasSymbols].filter(
    Boolean,
  ).length;

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

function PasswordStrengthBar({ password }: { password: string }): ReactElement {
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
          transition={{
            duration: shouldReduceMotion ? 0 : 0.25,
            ease: "easeOut",
          }}
        />
      </div>
      <p
        className={`font-dm-sans text-caption ${textClassName[strength.tone]}`}
      >
        {strength.label}
      </p>
    </div>
  );
}

export default function RegisterForm(): ReactElement {
  const register = useAuthStore((state) => state.register);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [values, setValues] = useState<RegisterValues>(initialRegisterValues);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [phoneCountry, setPhoneCountry] = useState<PhoneSelection | undefined>(
    undefined,
  );
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  function updateField<K extends keyof RegisterValues>(
    key: K,
    value: RegisterValues[K],
  ): void {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError("");
  }

  function handlePhoneChange(
    value: string,
    nextPhoneCountry: PhoneSelection,
  ): void {
    setValues((current) => ({ ...current, phone: value }));
    setPhoneCountry(nextPhoneCountry);
    setErrors((current) => ({
      ...current,
      phone: value.trim()
        ? validateInternationalPhoneLive(value, nextPhoneCountry)
        : undefined,
    }));
    setSubmitError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const nextErrors = validateRegister(values, phoneCountry);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      const submittedAddress = values.email.trim();
      const result = await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: submittedAddress,
        phone: values.phone.trim() || undefined,
        password: values.password,
      });

      setSubmitError("");
      setSubmittedEmail(submittedAddress);
      setSuccessMessage(
        result.emailConfirmationRequired
          ? "Your account has been created. Please check your email to confirm your account before signing in."
          : "Your account is ready. You can continue into Wahi now.",
      );
      setValues(initialRegisterValues);
      setErrors({});
      setPhoneCountry(undefined);
      setIsPasswordVisible(false);
      setIsConfirmPasswordVisible(false);
    } catch (error) {
      setSuccessMessage("");
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We couldn't create your account right now.",
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
      <Dialog
        onOpenChange={(open): void => {
          if (!open) {
            setSuccessMessage("");
          }
        }}
        open={Boolean(successMessage)}
      >
        <DialogContent
          className="w-[min(92vw,28rem)] rounded-[28px] border border-border-warm bg-ivory p-0 text-obsidian shadow-card"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Registration successful</DialogTitle>
          <DialogDescription className="sr-only">
            Your account has been created and email confirmation is required before signing in.
          </DialogDescription>
          <div className="overflow-hidden rounded-[28px]">
            <div className="border-b border-border-warm bg-cream px-6 pb-5 pt-6 sm:px-7 sm:pt-7">
              <div className="flex size-14 items-center justify-center rounded-full bg-gold/20 text-gold">
                <MailCheck className="size-7" />
              </div>
              <div className="mt-5 space-y-3">
                <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
                  Check Your Email
                </p>
                <h2 className="font-cormorant text-h2 leading-none text-obsidian">
                  Your Wahi account is almost ready.
                </h2>
                <p className="font-dm-sans text-body-sm leading-7 text-text-secondary">
                  {successMessage}
                </p>
              </div>
            </div>

            <div className="space-y-5 px-6 pb-6 pt-5 sm:px-7 sm:pb-7">
              <div className="rounded-2xl border border-border-warm bg-cream px-4 py-4">
                <p className="font-dm-sans text-caption uppercase tracking-[0.14em] text-text-muted">
                  Confirmation Email Sent To
                </p>
                <p className="mt-2 break-all font-dm-sans text-body-sm font-medium text-obsidian">
                  {submittedEmail}
                </p>
              </div>

              <div className="space-y-3 font-dm-sans text-body-sm text-text-secondary">
                <p>Open the message from Wahi Fashion and confirm your email address.</p>
                <p>Once confirmed, return here and sign in to continue shopping.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-12 flex-1 rounded-full bg-gold font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
                >
                  <Link href="/auth/login">
                    Continue to Sign In
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  className="h-12 rounded-full border border-border-warm bg-transparent px-5 font-dm-sans text-body-sm font-medium text-obsidian hover:border-gold hover:bg-cream"
                  onClick={(): void => setSuccessMessage("")}
                  type="button"
                  variant="ghost"
                >
                  Stay Here
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              onChange={(event): void =>
                updateField("firstName", event.target.value)
              }
              placeholder="Jon"
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
              onChange={(event): void =>
                updateField("lastName", event.target.value)
              }
              placeholder="Doe"
              value={values.lastName}
            />
            <FieldError message={errors.lastName} />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            className="font-dm-sans text-body-sm text-obsidian"
            htmlFor="email"
          >
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
          <Label
            className="font-dm-sans text-body-sm text-obsidian"
            htmlFor="phone"
          >
            Phone
          </Label>
          <PhoneField
            error={errors.phone}
            id="phone"
            onChange={handlePhoneChange}
            value={values.phone}
          />
        </div>

        <div className="space-y-2">
          <Label
            className="font-dm-sans text-body-sm text-obsidian"
            htmlFor="password"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              className="h-12 rounded-lg border-border-warm bg-ivory px-4 pr-12 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20"
              id="password"
              onChange={(event): void =>
                updateField("password", event.target.value)
              }
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
              {isPasswordVisible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
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
          <Button
            className={primaryButtonClassName}
            disabled={isLoading}
            type="submit"
          >
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

        {submitError ? (
          <p className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 font-dm-sans text-body-sm text-error">
            {submitError}
          </p>
        ) : null}

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border-warm" />
            <span className="font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
              or
            </span>
            <div className="h-px flex-1 bg-border-warm" />
          </div>

          <Button
            className="h-12 w-full rounded-lg border border-border-warm bg-transparent font-dm-sans text-body-sm font-medium text-obsidian hover:border-gold hover:bg-cream"
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
        </div>
      </form>
    </AuthShell>
  );
}
