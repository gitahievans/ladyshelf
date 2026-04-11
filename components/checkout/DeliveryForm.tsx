"use client";

import type { FormEvent, ReactElement } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DeliveryDetails } from "@/lib/types";

interface DeliveryFormProps {
  onSubmit: (data: DeliveryDetails) => void;
  defaultValues?: Partial<DeliveryDetails>;
  isGuest?: boolean;
}

type DeliveryErrors = Partial<Record<keyof DeliveryDetails, string>>;

const kenyanCounties: string[] = Array.from(
  new Set([
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Eldoret",
    "Thika",
    "Kiambu",
    "Machakos",
    "Nyeri",
    "Meru",
    "Embu",
    "Kitui",
    "Makueni",
    "Kajiado",
    "Narok",
    "Kericho",
    "Bomet",
    "Nandi",
    "Uasin Gishu",
    "Trans Nzoia",
    "Bungoma",
    "Kakamega",
    "Vihiga",
    "Siaya",
    "Kisii",
    "Nyamira",
    "Migori",
    "Homa Bay",
    "Kilifi",
    "Kwale",
    "Taita Taveta",
    "Tana River",
    "Lamu",
    "Garissa",
    "Wajir",
    "Mandera",
    "Marsabit",
    "Isiolo",
    "Tharaka Nithi",
    "Kirinyaga",
    "Murang'a",
    "Nyandarua",
    "Laikipia",
    "Samburu",
    "Baringo",
    "West Pokot",
    "Turkana",
    "Elgeyo Marakwet",
  ]),
);

const fieldClassName =
  "h-12 rounded-2xl border-border-warm bg-ivory px-4 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20";

const textAreaClassName =
  "min-h-28 w-full rounded-2xl border border-border-warm bg-ivory px-4 py-3 font-dm-sans text-body-sm text-obsidian outline-none transition-colors placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/20";

const initialValues: DeliveryDetails = {
  fullName: "",
  email: "",
  phone: "",
  county: "",
  town: "",
  streetAddress: "",
  additionalInfo: "",
  deliveryMethod: "delivery",
};

function validateDeliveryDetails(values: DeliveryDetails): DeliveryErrors {
  const errors: DeliveryErrors = {};

  if (!values.fullName.trim()) errors.fullName = "Please add the name for this delivery.";
  if (!values.email.trim()) {
    errors.email = "Please add your email address.";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Add an email address in a valid format.";
  }
  if (!values.phone.trim()) errors.phone = "Please add the phone number we should use.";
  if (!values.county.trim()) errors.county = "Please choose a county.";
  if (!values.town.trim()) errors.town = "Please add your town.";
  if (!values.streetAddress.trim()) errors.streetAddress = "Please add the street address.";

  return errors;
}

function FieldError({ message }: { message?: string }): ReactElement | null {
  if (!message) return null;

  return <p className="font-dm-sans text-caption text-error">{message}</p>;
}

export default function DeliveryForm({
  onSubmit,
  defaultValues,
  isGuest = false,
}: DeliveryFormProps): ReactElement {
  const [formValues, setFormValues] = useState<DeliveryDetails>({
    ...initialValues,
    ...defaultValues,
  });
  const [errors, setErrors] = useState<DeliveryErrors>({});

  useEffect((): void => {
    setFormValues({
      ...initialValues,
      ...defaultValues,
      deliveryMethod: defaultValues?.deliveryMethod ?? "delivery",
    });
  }, [defaultValues]);

  function updateField<K extends keyof DeliveryDetails>(
    key: K,
    value: DeliveryDetails[K],
  ): void {
    setFormValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nextErrors = validateDeliveryDetails(formValues);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      ...formValues,
      additionalInfo: formValues.additionalInfo?.trim() || undefined,
    });
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

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="fullName">
            Full Name
          </Label>
          <Input
            className={fieldClassName}
            id="fullName"
            onChange={(event): void => updateField("fullName", event.target.value)}
            placeholder="Amina Wanjiru"
            value={formValues.fullName}
          />
          <FieldError message={errors.fullName} />
        </div>

        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="email">
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
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="phone">
            Phone
          </Label>
          <Input
            className={fieldClassName}
            id="phone"
            onChange={(event): void => updateField("phone", event.target.value)}
            placeholder="+254 XXX XXX XXX"
            value={formValues.phone}
          />
          <FieldError message={errors.phone} />
        </div>

        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian">County</Label>
          <Select
            onValueChange={(value): void => updateField("county", value)}
            value={formValues.county}
          >
            <SelectTrigger className={fieldClassName}>
              <SelectValue placeholder="Choose county" />
            </SelectTrigger>
            <SelectContent className="border border-border-warm bg-ivory text-obsidian">
              {kenyanCounties.map((county) => (
                <SelectItem
                  className="font-dm-sans text-body-sm focus:bg-cream focus:text-obsidian"
                  key={county}
                  value={county}
                >
                  {county}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.county} />
        </div>

        <div className="space-y-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="town">
            Town
          </Label>
          <Input
            className={fieldClassName}
            id="town"
            onChange={(event): void => updateField("town", event.target.value)}
            placeholder="Westlands"
            value={formValues.town}
          />
          <FieldError message={errors.town} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="streetAddress">
            Street Address
          </Label>
          <Input
            className={fieldClassName}
            id="streetAddress"
            onChange={(event): void => updateField("streetAddress", event.target.value)}
            placeholder="House number, road, estate"
            value={formValues.streetAddress}
          />
          <FieldError message={errors.streetAddress} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="additionalInfo">
            Additional Info
          </Label>
          <textarea
            className={textAreaClassName}
            id="additionalInfo"
            onChange={(event): void => updateField("additionalInfo", event.target.value)}
            placeholder="Landmark, gate instructions, or anything else we should know."
            value={formValues.additionalInfo ?? ""}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="font-dm-sans text-body-sm text-obsidian">Delivery Method</p>
        <div className="grid gap-3">
          <button
            className={formValues.deliveryMethod === "delivery" ? "rounded-2xl border border-gold bg-ivory p-4 text-left transition-colors" : "rounded-2xl border border-border-warm bg-ivory p-4 text-left transition-colors hover:border-gold/60"}
            onClick={(): void => updateField("deliveryMethod", "delivery")}
            type="button"
          >
            <p className="font-dm-sans text-body-sm font-medium text-obsidian">
              Standard Delivery
            </p>
            <p className="mt-1 font-dm-sans text-body-sm text-text-secondary">
              2-3 business days within Nairobi, 3-5 days upcountry.
            </p>
          </button>

          <button
            className={formValues.deliveryMethod === "pickup" ? "rounded-2xl border border-gold bg-ivory p-4 text-left transition-colors" : "rounded-2xl border border-border-warm bg-ivory p-4 text-left transition-colors hover:border-gold/60"}
            onClick={(): void => updateField("deliveryMethod", "pickup")}
            type="button"
          >
            <p className="font-dm-sans text-body-sm font-medium text-obsidian">
              Pickup from Store
            </p>
            <p className="mt-1 font-dm-sans text-body-sm text-text-secondary">
              Lumumba Drive, Roysambu. Mon-Sat 9am-7pm.
            </p>
          </button>
        </div>
      </div>

      {isGuest ? (
        <div className="rounded-2xl border border-bark/20 bg-ivory p-4">
          <p className="font-dm-sans text-body-sm text-text-secondary">
            Save time next time.{" "}
            <Link className="font-medium text-gold transition-colors hover:text-bark" href="/auth/register">
              Join Wahi
            </Link>
            .
          </p>
        </div>
      ) : null}

      <Button
        className="h-12 w-full rounded-full bg-gold font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
        type="submit"
      >
        Continue to Payment
      </Button>
    </form>
  );
}
