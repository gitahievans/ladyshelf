"use client";

import type { FormEvent, ReactElement } from "react";
import { useEffect, useState } from "react";
import { Banknote, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type {
  CheckoutPaymentOption,
  CheckoutPaymentSelection,
  CheckoutQuote,
} from "@/lib/types";

interface PaymentMethodProps {
  availableOptions: CheckoutPaymentOption[];
  defaultSelection?: CheckoutPaymentSelection | null;
  onSubmit: (selection: CheckoutPaymentSelection) => void;
  quote: CheckoutQuote;
  isSubmitting?: boolean;
  submitError?: string | null;
}

type PaymentErrors = Record<string, string>;

function PaymentError({ message }: { message?: string }): ReactElement | null {
  if (!message) return null;

  return <p className="font-dm-sans text-caption text-error">{message}</p>;
}

function getOptionIcon(option: CheckoutPaymentOption): ReactElement {
  if (option.timing === "pay_on_delivery") {
    return <Banknote className="size-5" />;
  }

  return <Smartphone className="size-5" />;
}

function getSelectionKey(selection: CheckoutPaymentSelection | null | undefined): string {
  if (!selection) {
    return "";
  }

  return `${selection.method}-${selection.timing}`;
}

export default function PaymentMethod({
  availableOptions,
  defaultSelection = null,
  onSubmit,
  quote,
  isSubmitting = false,
  submitError = null,
}: PaymentMethodProps): ReactElement {
  const hasSinglePrepayOption =
    availableOptions.length === 1 && availableOptions[0]?.timing === "prepay";
  const [selectedOptionKey, setSelectedOptionKey] = useState<string>(
    getSelectionKey(defaultSelection) || availableOptions[0]?.key || "",
  );
  const [errors, setErrors] = useState<PaymentErrors>({});

  useEffect((): void => {
    setSelectedOptionKey(getSelectionKey(defaultSelection) || availableOptions[0]?.key || "");
  }, [availableOptions, defaultSelection]);

  const selectedOption =
    availableOptions.find((option) => option.key === selectedOptionKey) ?? availableOptions[0];

  function chooseOption(option: CheckoutPaymentOption): void {
    setSelectedOptionKey(option.key);
    setErrors({});
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!selectedOption) {
      setErrors({
        payment: "Choose a payment option to continue.",
      });
      return;
    }

    const nextErrors: PaymentErrors = {};

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      method: selectedOption.method,
      timing: selectedOption.timing,
    });
  }

  return (
    <form
      className="space-y-8 rounded-[28px] border border-border-warm bg-cream p-6 shadow-card sm:p-8"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
          Step 2
        </p>
        <h2 className="font-cormorant text-h2 text-obsidian">
          {hasSinglePrepayOption ? "Secure payment, next." : "Choose the way you want to pay."}
        </h2>
        <p className="font-dm-sans text-body-sm text-text-secondary">
          {hasSinglePrepayOption
            ? "Your order will continue to the secure SasaPay page to complete payment."
            : "Available options now come from your selected delivery route."}
        </p>
      </div>

      <div className="rounded-2xl border border-bark/20 bg-ivory p-4">
        <div className="space-y-2 font-dm-sans text-body-sm text-text-secondary">
          <p className="font-medium text-obsidian">
            {quote.deliveryMode === "pickup"
              ? "Store pickup is prepaid only."
              : quote.deliveryMode === "parcel"
                ? "Parcel delivery is prepaid only."
                : "Rider delivery supports prepaid options and M-Pesa on delivery."}
          </p>
          {quote.manualDeliveryFeeConfirmationRequired ? (
            <p>The final parcel delivery fee will be confirmed by the store.</p>
          ) : null}
          {quote.estimatedWindow ? <p>Estimated timeline: {quote.estimatedWindow}</p> : null}
        </div>
      </div>

      <div className="space-y-4">
        {availableOptions.map((option) => {
          const isSelected = selectedOption?.key === option.key;

          return (
            <button
              className={cn(
                "w-full rounded-2xl border p-5 text-left transition-colors",
                hasSinglePrepayOption ? "pointer-events-none" : "",
                isSelected
                  ? "border-gold bg-cream"
                  : "border-border-warm bg-ivory hover:border-gold/60",
              )}
              key={option.key}
              onClick={(): void => chooseOption(option)}
              type="button"
            >
              <div className="flex items-start gap-4">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-obsidian text-gold">
                  {getOptionIcon(option)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-dm-sans text-body-sm font-medium text-obsidian">
                    {option.label}
                  </p>
                  <p className="font-dm-sans text-body-sm text-text-secondary">
                    {option.description}
                  </p>
                </div>
              </div>

              {isSelected && option.method === "mpesa" && option.timing === "prepay" ? (
                <div className="mt-4 space-y-2">
                  <p className="font-dm-sans text-body-sm text-text-secondary">
                    You will be taken to the secure SasaPay page to complete payment and enter
                    your M-Pesa number there.
                  </p>
                </div>
              ) : null}

              {isSelected && option.timing === "pay_on_delivery" ? (
                <p className="mt-4 font-dm-sans text-body-sm text-text-secondary">
                  Keep the checkout phone number close. Payment is collected by M-Pesa
                  when the rider arrives.
                </p>
              ) : null}
            </button>
          );
        })}
      </div>

      {errors.payment ? <PaymentError message={errors.payment} /> : null}

      {submitError ? (
        <div className="rounded-2xl border border-error/20 bg-error/10 px-4 py-3">
          <p className="font-dm-sans text-body-sm text-error">{submitError}</p>
        </div>
      ) : null}

      <Button
        className="h-12 w-full rounded-full bg-gold font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
        disabled={isSubmitting || availableOptions.length === 0}
        type="submit"
      >
        {isSubmitting ? "Validating Payment..." : "Continue to Review"}
      </Button>
    </form>
  );
}
