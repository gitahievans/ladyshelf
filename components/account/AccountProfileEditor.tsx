"use client";

import type { FormEvent, ReactElement } from "react";
import { useEffect, useState } from "react";

import PhoneField from "@/components/shared/PhoneField";
import SectionHeader from "@/components/shared/SectionHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/types";
import {
  type PhoneSelection,
  validateInternationalPhone,
  validateInternationalPhoneLive,
} from "@/lib/utils/phone";
import { useAuthStore } from "@/stores/authStore";

interface AccountProfileEditorProps {
  user: User;
}

interface ProfileValues {
  firstName: string;
  lastName: string;
  phone: string;
}

type ProfileErrors = Partial<Record<keyof ProfileValues, string>>;

const formFieldClassName =
  "h-12 rounded-lg border-border-warm bg-ivory px-4 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20";

const primaryButtonClassName =
  "h-12 rounded-lg bg-gold px-6 font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand";

function validateProfile(
  values: ProfileValues,
  phoneCountry?: PhoneSelection,
): ProfileErrors {
  const errors: ProfileErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "Please add your first name.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Please add your last name.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Please add the phone number we should use.";
  } else {
    const phoneError = validateInternationalPhone(values.phone, {
      required: true,
      requiredMessage: "Please add the phone number we should use.",
    }, phoneCountry);

    if (phoneError) {
      errors.phone = phoneError;
    }
  }

  return errors;
}

function FieldError({ message }: { message?: string }): ReactElement | null {
  if (!message) {
    return null;
  }

  return <p className="font-dm-sans text-caption text-error">{message}</p>;
}

export default function AccountProfileEditor({
  user,
}: AccountProfileEditorProps): ReactElement {
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [values, setValues] = useState<ProfileValues>({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? "",
  });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [phoneCountry, setPhoneCountry] = useState<PhoneSelection | undefined>(
    undefined,
  );
  const [submitError, setSubmitError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect((): void => {
    setValues({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? "",
    });
  }, [user.firstName, user.lastName, user.phone]);

  function updateField<K extends keyof ProfileValues>(
    key: K,
    value: ProfileValues[K],
  ): void {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError("");
    setSuccessMessage("");
  }

  function handlePhoneChange(
    value: string,
    nextPhoneCountry: PhoneSelection,
  ): void {
    setValues((current) => ({ ...current, phone: value }));
    setPhoneCountry(nextPhoneCountry);
    setErrors((current) => ({
      ...current,
      phone: validateInternationalPhoneLive(value, nextPhoneCountry),
    }));
    setSubmitError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const nextErrors = validateProfile(values, phoneCountry);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      await updateProfile({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim(),
      });
      setSubmitError("");
      setSuccessMessage("Your profile details are now up to date.");
    } catch (error) {
      setSuccessMessage("");
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We couldn't update your profile right now.",
      );
    }
  }

  return (
    <section className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
      <SectionHeader
        label="Profile Details"
        subtitle="Keep your contact details current so deliveries and SMS updates reach you without friction."
        title="Edit your name and phone"
      />

      <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="account-first-name">
              First Name
            </Label>
            <Input
              className={formFieldClassName}
              id="account-first-name"
              onChange={(event): void => updateField("firstName", event.target.value)}
              value={values.firstName}
            />
            <FieldError message={errors.firstName} />
          </div>

          <div className="space-y-2">
            <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="account-last-name">
              Last Name
            </Label>
            <Input
              className={formFieldClassName}
              id="account-last-name"
              onChange={(event): void => updateField("lastName", event.target.value)}
              value={values.lastName}
            />
            <FieldError message={errors.lastName} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="account-phone">
            Phone Number
          </Label>
          <PhoneField
            error={errors.phone}
            id="account-phone"
            onChange={handlePhoneChange}
            value={values.phone}
          />
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
              Saving details...
            </span>
          ) : (
            "Save Profile"
          )}
        </Button>
      </form>
    </section>
  );
}
