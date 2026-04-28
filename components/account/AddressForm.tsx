"use client";

import type { FormEvent, ReactElement } from "react";
import { useEffect, useState } from "react";

import LocationSearch from "@/components/checkout/LocationSearch";
import PhoneField from "@/components/shared/PhoneField";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateInternationalPhone } from "@/lib/utils/phone";
import type { Address, AddressInput, MapboxLocationSuggestion } from "@/lib/types";
import type { PhoneSelection } from "@/lib/utils/phone";

interface AddressFormProps {
  initialValue?: Address | null;
  isSubmitting?: boolean;
  submitError?: string;
  onCancel: () => void;
  onSubmit: (value: AddressInput) => void;
}

type AddressErrors = Partial<Record<keyof AddressInput, string>>;

const fieldClassName =
  "h-12 rounded-lg border-border-warm bg-ivory px-4 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20";

const textAreaClassName =
  "min-h-24 w-full rounded-lg border border-border-warm bg-ivory px-4 py-3 font-dm-sans text-body-sm text-obsidian outline-none transition-colors placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/20";

const buttonClassName =
  "h-11 rounded-lg bg-gold px-5 font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand";

function buildInitialLocationQuery(address?: Address | null): string {
  if (!address) {
    return "";
  }

  return [address.town, address.county].filter(Boolean).join(", ");
}

function buildInitialValue(address?: Address | null): AddressInput {
  return {
    label: address?.label ?? "home",
    fullName: address?.fullName ?? "",
    phone: address?.phone ?? "",
    county: address?.county ?? "",
    town: address?.town ?? "",
    streetAddress: address?.streetAddress ?? "",
    additionalInfo: address?.additionalInfo ?? "",
    isDefault: address?.isDefault ?? false,
  };
}

function validateAddress(
  values: AddressInput,
  phoneCountry?: PhoneSelection,
): AddressErrors {
  const errors: AddressErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Please add the full name for this address.";
  }

  const phoneError = validateInternationalPhone(
    values.phone,
    {
      required: true,
      requiredMessage: "Please add the phone number for this address.",
    },
    phoneCountry,
  );

  if (phoneError) {
    errors.phone = phoneError;
  }

  if (!values.county.trim()) {
    errors.county = "Please choose your area from the location suggestions.";
  }

  if (!values.town.trim()) {
    errors.town = "Please choose your area from the location suggestions.";
  }

  if (!values.streetAddress.trim()) {
    errors.streetAddress = "Please add the street or estate address.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }): ReactElement | null {
  if (!message) {
    return null;
  }

  return <p className="font-dm-sans text-caption text-error">{message}</p>;
}

export default function AddressForm({
  initialValue = null,
  isSubmitting = false,
  submitError,
  onCancel,
  onSubmit,
}: AddressFormProps): ReactElement {
  const [values, setValues] = useState<AddressInput>(buildInitialValue(initialValue));
  const [errors, setErrors] = useState<AddressErrors>({});
  const [phoneCountry, setPhoneCountry] = useState<PhoneSelection | undefined>(undefined);
  const [locationQuery, setLocationQuery] = useState<string>(buildInitialLocationQuery(initialValue));

  useEffect((): void => {
    setValues(buildInitialValue(initialValue));
    setErrors({});
    setLocationQuery(buildInitialLocationQuery(initialValue));
  }, [initialValue]);

  function updateField<K extends keyof AddressInput>(key: K, value: AddressInput[K]): void {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleLocationSelect(suggestion: MapboxLocationSuggestion): void {
    setValues((current) => ({
      ...current,
      county: suggestion.county,
      town: suggestion.town || suggestion.label,
    }));
    setLocationQuery(suggestion.label);
    setErrors((current) => ({
      ...current,
      county: undefined,
      town: undefined,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nextErrors = validateAddress(values, phoneCountry);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      ...values,
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      county: values.county.trim(),
      town: values.town.trim(),
      streetAddress: values.streetAddress.trim(),
      additionalInfo: values.additionalInfo?.trim() || undefined,
    });
  }

  return (
    <form className="space-y-5 rounded-lg border border-border-warm bg-cream p-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="address-label">
            Label
          </Label>
          <select
            className={fieldClassName}
            id="address-label"
            onChange={(event): void => updateField("label", event.target.value as AddressInput["label"])}
            value={values.label}
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="address-full-name">
            Full Name
          </Label>
          <Input className={fieldClassName} id="address-full-name" onChange={(event): void => updateField("fullName", event.target.value)} value={values.fullName} />
          <FieldError message={errors.fullName} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="address-phone">
          Phone
        </Label>
        <PhoneField
          error={errors.phone}
          id="address-phone"
          onChange={(value, country): void => {
            updateField("phone", value);
            setPhoneCountry(country);
          }}
          value={values.phone}
        />
      </div>

      <div className="space-y-2">
        <Label className="font-dm-sans text-body-sm text-obsidian">
          Delivery Area
        </Label>
        <LocationSearch
          error={errors.county || errors.town}
          initialQuery={locationQuery}
          onQueryChange={(query): void => {
            setLocationQuery(query);
            setValues((current) => ({
              ...current,
              county: "",
              town: "",
            }));
            setErrors((current) => ({
              ...current,
              county: undefined,
              town: undefined,
            }));
          }}
          onSelect={handleLocationSelect}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="address-county">
            County
          </Label>
          <Input className={fieldClassName} id="address-county" readOnly value={values.county} />
        </div>

        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="address-town">
            Town / Area
          </Label>
          <Input className={fieldClassName} id="address-town" readOnly value={values.town} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="address-street">
          Street Address
        </Label>
        <Input className={fieldClassName} id="address-street" onChange={(event): void => updateField("streetAddress", event.target.value)} value={values.streetAddress} />
        <FieldError message={errors.streetAddress} />
      </div>

      <div className="space-y-2">
        <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="address-info">
          Additional Info
        </Label>
        <textarea className={textAreaClassName} id="address-info" onChange={(event): void => updateField("additionalInfo", event.target.value)} value={values.additionalInfo ?? ""} />
      </div>

      <label className="flex items-center gap-3 font-dm-sans text-body-sm text-obsidian">
        <input
          checked={values.isDefault}
          className="size-4 rounded border-border-warm text-gold focus:ring-gold"
          onChange={(event): void => updateField("isDefault", event.target.checked)}
          type="checkbox"
        />
        Set as my default delivery address
      </label>

      {submitError ? (
        <p className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 font-dm-sans text-body-sm text-error">
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button className={buttonClassName} disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <LoadingSpinner className="border-t-obsidian" size="sm" />
              Saving...
            </span>
          ) : initialValue ? (
            "Save Address"
          ) : (
            "Add Address"
          )}
        </Button>
        <Button
          className="h-11 rounded-lg border border-border-warm bg-transparent px-5 font-dm-sans text-body-sm font-medium text-obsidian hover:border-gold hover:bg-cream"
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="ghost"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
