"use client";

import type { FormEvent, ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, MapPin, Phone } from "lucide-react";

import LocationSearch from "@/components/checkout/LocationSearch";
import PhoneField from "@/components/shared/PhoneField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchKenyanLocations } from "@/lib/mapbox";
import { cn } from "@/lib/utils/cn";
import {
  type PhoneSelection,
  validateInternationalPhone,
  validateInternationalPhoneLive,
} from "@/lib/utils/phone";
import type {
  DeliveryDetails,
  MapboxLocationSuggestion,
  PickupInfo,
} from "@/lib/types";

interface DeliveryFormProps {
  onSubmit: (data: DeliveryDetails) => void;
  onChange?: (data: DeliveryDetails) => void;
  defaultValues?: Partial<DeliveryDetails>;
  isGuest?: boolean;
  saveAddressByDefault?: boolean;
  isSubmitting?: boolean;
  submitError?: string | null;
  pickupInfo?: PickupInfo | null;
  onSaveAddressChange?: (shouldSave: boolean) => void;
}

type DeliveryErrors = Partial<Record<keyof DeliveryDetails, string>>;

const fieldClassName =
  "h-12 rounded-2xl border-border-warm bg-ivory px-4 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20";

const textAreaClassName =
  "min-h-28 w-full rounded-2xl border border-border-warm bg-ivory px-4 py-3 font-dm-sans text-body-sm text-obsidian outline-none transition-colors placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/20";

const optionButtonClassName =
  "rounded-2xl border p-4 text-left transition-colors focus-visible:border-gold focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-gold/30";

const initialValues: DeliveryDetails = {
  fullName: "",
  email: "",
  phone: "",
  county: "",
  town: "",
  locationLabel: "",
  latitude: null,
  longitude: null,
  streetAddress: "",
  additionalInfo: "",
  deliveryMethod: "delivery",
};

function validateDeliveryDetails(
  values: DeliveryDetails,
  phoneCountry?: PhoneSelection,
): DeliveryErrors {
  const errors: DeliveryErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Please add the name for this delivery.";
  }
  if (!values.email.trim()) {
    errors.email = "Please add your email address.";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Add an email address in a valid format.";
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

  if (values.deliveryMethod === "delivery") {
    if (
      !values.locationLabel?.trim() ||
      values.latitude == null ||
      values.longitude == null
    ) {
      errors.locationLabel =
        "Please choose your location from the search suggestions.";
    }
    if (!values.county.trim()) {
      errors.county = "Please choose your delivery location from search first.";
    }
    if (!values.town.trim()) {
      errors.town = "Please choose your delivery location from search first.";
    }
    if (!values.streetAddress.trim()) {
      errors.streetAddress =
        "Please add the building, estate, or exact drop-off address.";
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

function buildInitialLocationQuery(
  defaultValues?: Partial<DeliveryDetails>,
): string {
  if (!defaultValues) {
    return "";
  }

  return (
    defaultValues.locationLabel ??
    [defaultValues.town, defaultValues.county].filter(Boolean).join(", ")
  );
}

export default function DeliveryForm({
  onSubmit,
  onChange,
  defaultValues,
  isGuest = false,
  saveAddressByDefault = false,
  isSubmitting = false,
  submitError = null,
  pickupInfo = null,
  onSaveAddressChange,
}: DeliveryFormProps): ReactElement {
  const resolvedInitialLocationQuery = buildInitialLocationQuery(defaultValues);
  const [formValues, setFormValues] = useState<DeliveryDetails>({
    ...initialValues,
    ...defaultValues,
    locationLabel: defaultValues?.locationLabel ?? resolvedInitialLocationQuery,
  });
  const [errors, setErrors] = useState<DeliveryErrors>({});
  const [phoneCountry, setPhoneCountry] = useState<PhoneSelection | undefined>(
    undefined,
  );
  const [shouldSaveAddress, setShouldSaveAddress] = useState<boolean>(saveAddressByDefault);
  const initialLocationQuery = useMemo(
    () => resolvedInitialLocationQuery,
    [resolvedInitialLocationQuery],
  );

  useEffect((): void => {
    const nextInitialLocationQuery = buildInitialLocationQuery(defaultValues);
    setFormValues({
      ...initialValues,
      ...defaultValues,
      deliveryMethod: defaultValues?.deliveryMethod ?? "delivery",
      locationLabel: defaultValues?.locationLabel ?? nextInitialLocationQuery,
      latitude: defaultValues?.latitude ?? null,
      longitude: defaultValues?.longitude ?? null,
    });
  }, [defaultValues]);

  useEffect((): void => {
    setShouldSaveAddress(saveAddressByDefault);
  }, [saveAddressByDefault]);

  useEffect((): void => {
    onChange?.(formValues);
  }, [formValues, onChange]);

  useEffect((): void => {
    onSaveAddressChange?.(shouldSaveAddress);
  }, [onSaveAddressChange, shouldSaveAddress]);

  useEffect((): (() => void) | void => {
    if (
      formValues.deliveryMethod !== "delivery" ||
      !formValues.locationLabel?.trim() ||
      formValues.latitude != null ||
      formValues.longitude != null
    ) {
      return;
    }

    let isMounted = true;

    void (async (): Promise<void> => {
      const suggestions = await searchKenyanLocations(formValues.locationLabel ?? "");

      if (!isMounted || suggestions.length === 0) {
        return;
      }

      const matchedSuggestion =
        suggestions.find(
          (suggestion) =>
            suggestion.county.toLowerCase() === formValues.county.toLowerCase() &&
            suggestion.town.toLowerCase() === formValues.town.toLowerCase(),
        ) ?? suggestions[0];

      setFormValues((current) => ({
        ...current,
        locationLabel: matchedSuggestion.label,
        latitude: matchedSuggestion.latitude,
        longitude: matchedSuggestion.longitude,
      }));
      setErrors((current) => ({
        ...current,
        locationLabel: undefined,
      }));
    })();

    return (): void => {
      isMounted = false;
    };
  }, [
    formValues.county,
    formValues.deliveryMethod,
    formValues.latitude,
    formValues.locationLabel,
    formValues.longitude,
    formValues.town,
  ]);

  function updateField<K extends keyof DeliveryDetails>(
    key: K,
    value: DeliveryDetails[K],
  ): void {
    setFormValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handlePhoneChange(
    value: string,
    nextPhoneCountry: PhoneSelection,
  ): void {
    setFormValues((current) => ({ ...current, phone: value }));
    setPhoneCountry(nextPhoneCountry);
    setErrors((current) => ({
      ...current,
      phone: validateInternationalPhoneLive(value, nextPhoneCountry),
    }));
  }

  function handleLocationSelect(suggestion: MapboxLocationSuggestion): void {
    setFormValues((current) => ({
      ...current,
      county: suggestion.county,
      town: suggestion.town || suggestion.label,
      locationLabel: suggestion.label,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    }));
    setErrors((current) => ({
      ...current,
      locationLabel: undefined,
      county: undefined,
      town: undefined,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nextErrors = validateDeliveryDetails(formValues, phoneCountry);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const isPickup = formValues.deliveryMethod === "pickup";

    onSubmit({
      ...formValues,
      county: isPickup
        ? (pickupInfo?.county ?? "Nairobi")
        : formValues.county.trim(),
      town: isPickup
        ? (pickupInfo?.town ?? "Roysambu")
        : formValues.town.trim(),
      locationLabel: isPickup
        ? (pickupInfo?.streetAddress ?? "Lumumba Drive, Roysambu")
        : formValues.locationLabel?.trim(),
      latitude: isPickup ? null : formValues.latitude,
      longitude: isPickup ? null : formValues.longitude,
      streetAddress: isPickup
        ? (pickupInfo?.streetAddress ?? "Lumumba Drive, Roysambu")
        : formValues.streetAddress.trim(),
      additionalInfo: formValues.additionalInfo?.trim() || undefined,
    });
  }

  function getDeliveryMethodClassName(method: DeliveryDetails["deliveryMethod"]): string {
    const isSelected = formValues.deliveryMethod === method;

    return cn(
      optionButtonClassName,
      isSelected
        ? "border-2 border-gold bg-gold/15 ring-2 ring-gold/30"
        : "border-border-warm bg-ivory hover:border-gold/60 hover:bg-cream",
    );
  }

  function renderSelectedBadge(): ReactElement {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold px-3 py-1 font-dm-sans text-caption font-medium text-obsidian">
        <CheckCircle2 className="size-3.5" />
        Selected
      </span>
    );
  }

  return (
    <form
      className="space-y-8 rounded-[28px] border border-border-warm bg-cream p-6 shadow-card sm:p-8"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
          Step 1
        </p>
        <h2 className="font-cormorant text-h2 text-obsidian">
          Delivery details, without the drag.
        </h2>
        <p className="font-dm-sans text-body-sm text-text-secondary">
          We only ask for what gets your order to the right door.
        </p>
      </div>

      <div className="space-y-3">
        <p className="font-dm-sans text-body-sm text-obsidian">
          Delivery Method
        </p>
        <div className="grid gap-3">
          <button
            aria-pressed={formValues.deliveryMethod === "delivery"}
            className={getDeliveryMethodClassName("delivery")}
            onClick={(): void => updateField("deliveryMethod", "delivery")}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 font-dm-sans text-body-sm font-medium text-obsidian">
                Standard Delivery
              </p>
              {formValues.deliveryMethod === "delivery" ? renderSelectedBadge() : null}
            </div>
            <p className="mt-1 font-dm-sans text-body-sm text-text-secondary">
              Rider delivery is automatic within the set radius. Beyond that,
              checkout switches to parcel delivery.
            </p>
          </button>

          <button
            aria-pressed={formValues.deliveryMethod === "pickup"}
            className={getDeliveryMethodClassName("pickup")}
            onClick={(): void => updateField("deliveryMethod", "pickup")}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 font-dm-sans text-body-sm font-medium text-obsidian">
                Pickup from Store
              </p>
              {formValues.deliveryMethod === "pickup" ? renderSelectedBadge() : null}
            </div>
            <p className="mt-1 font-dm-sans text-body-sm text-text-secondary">
              Lumumba Drive, Roysambu. Mon-Sat 9am-7pm.
            </p>
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label
            className="font-dm-sans text-body-sm text-obsidian"
            htmlFor="fullName"
          >
            Full Name
          </Label>
          <Input
            className={fieldClassName}
            id="fullName"
            onChange={(event): void =>
              updateField("fullName", event.target.value)
            }
            placeholder="Jane Doe"
            value={formValues.fullName}
          />
          <FieldError message={errors.fullName} />
        </div>

        <div className="space-y-2">
          <Label
            className="font-dm-sans text-body-sm text-obsidian"
            htmlFor="email"
          >
            Email
          </Label>
          <Input
            className={fieldClassName}
            id="email"
            onChange={(event): void => updateField("email", event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={formValues.email}
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
            value={formValues.phone}
          />
        </div>

        {formValues.deliveryMethod === "delivery" ? (
          <>
            <div className="space-y-2 md:col-span-2">
              <Label className="font-dm-sans text-body-sm text-obsidian">
                Delivery Location
              </Label>
              <LocationSearch
                error={errors.locationLabel}
                initialQuery={initialLocationQuery}
                onQueryChange={(query): void => {
                  setFormValues((current) => ({
                    ...current,
                    locationLabel: query,
                    latitude: null,
                    longitude: null,
                    county: "",
                    town: "",
                  }));
                }}
                onSelect={handleLocationSelect}
              />
            </div>

            <div className="space-y-2">
              <Label
                className="font-dm-sans text-body-sm text-obsidian"
                htmlFor="county"
              >
                County
              </Label>
              <Input
                className={fieldClassName}
                id="county"
                readOnly
                value={formValues.county}
              />
              <FieldError message={errors.county} />
            </div>

            <div className="space-y-2">
              <Label
                className="font-dm-sans text-body-sm text-obsidian"
                htmlFor="town"
              >
                Town / Area
              </Label>
              <Input
                className={fieldClassName}
                id="town"
                readOnly
                value={formValues.town}
              />
              <FieldError message={errors.town} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label
                className="font-dm-sans text-body-sm text-obsidian"
                htmlFor="streetAddress"
              >
                Building / Estate / Street Address
              </Label>
              <Input
                className={fieldClassName}
                id="streetAddress"
                onChange={(event): void =>
                  updateField("streetAddress", event.target.value)
                }
                placeholder="House number, apartment, estate, road"
                value={formValues.streetAddress}
              />
              <FieldError message={errors.streetAddress} />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-bark/20 bg-ivory p-5 md:col-span-2">
            <div className="space-y-3">
              <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
                Pickup Details
              </p>
              <div className="space-y-2 font-dm-sans text-body-sm text-text-secondary">
                <p className="font-medium text-obsidian">
                  {pickupInfo?.name ?? "Lady Shelf Pickup"}
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span>
                    {pickupInfo?.streetAddress ?? "Lumumba Drive, Roysambu"},{" "}
                    {pickupInfo?.town ?? "Roysambu"},{" "}
                    {pickupInfo?.county ?? "Nairobi"}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span>{pickupInfo?.contactPhone ?? "+254711000000"}</span>
                </p>
                <p>
                  {pickupInfo?.openingHours ?? "Mon-Sat 9am-7pm"}. Collect
                  within {pickupInfo?.collectionWindowHours ?? 72} hours after
                  confirmation.
                </p>
                {pickupInfo?.notes ? <p>{pickupInfo.notes}</p> : null}
                {pickupInfo?.mapsUrl ? (
                  <Link
                    className="inline-flex items-center gap-2 font-medium text-gold transition-colors hover:text-bark"
                    href={pickupInfo.mapsUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open in Google Maps
                    <ExternalLink className="size-4" />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 md:col-span-2">
          <Label
            className="font-dm-sans text-body-sm text-obsidian"
            htmlFor="additionalInfo"
          >
            Additional Info
          </Label>
          <textarea
            className={textAreaClassName}
            id="additionalInfo"
            onChange={(event): void =>
              updateField("additionalInfo", event.target.value)
            }
            placeholder="Landmark, gate instructions, or anything else we should know."
            value={formValues.additionalInfo ?? ""}
          />
        </div>
      </div>

      {submitError ? (
        <div className="rounded-2xl border border-error/20 bg-error/10 px-4 py-3">
          <p className="font-dm-sans text-body-sm text-error">{submitError}</p>
        </div>
      ) : null}

      {isGuest ? (
        <div className="rounded-2xl border border-bark/20 bg-ivory p-4">
          <p className="font-dm-sans text-body-sm text-text-secondary">
            Save time next time.{" "}
            <Link
              className="font-medium text-gold transition-colors hover:text-bark"
              href="/auth/register"
            >
              Join Lady Shelf
            </Link>
            .
          </p>
        </div>
      ) : formValues.deliveryMethod === "delivery" ? (
        <label
          className={cn(
            "flex items-center gap-3 rounded-2xl border p-4 font-dm-sans text-body-sm text-obsidian transition-colors focus-within:border-gold focus-within:outline-none focus-within:ring-3 focus-within:ring-gold/30",
            shouldSaveAddress
              ? "border-2 border-gold bg-gold/15 ring-2 ring-gold/30"
              : "border-bark/20 bg-ivory hover:border-gold/60 hover:bg-cream",
          )}
        >
          <input
            checked={shouldSaveAddress}
            className="size-4 rounded border-border-warm text-gold focus:ring-gold"
            onChange={(event): void => setShouldSaveAddress(event.target.checked)}
            type="checkbox"
          />
          <span className="flex-1">Save this delivery address to my account for next time.</span>
          {shouldSaveAddress ? (
            <CheckCircle2 className="size-5 shrink-0 text-gold" aria-hidden="true" />
          ) : null}
        </label>
      ) : null}

      <Button
        className="h-12 w-full rounded-full bg-gold font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Checking Delivery Rules..." : "Continue to Payment"}
      </Button>
    </form>
  );
}
