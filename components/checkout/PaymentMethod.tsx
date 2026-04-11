"use client";

import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import { Banknote, CreditCard, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import type { PaymentMethod as PaymentMethodType } from "@/lib/types";

interface PaymentMethodProps {
  onSubmit: (method: PaymentMethodType) => void;
  defaultMethod?: PaymentMethodType;
}

type PaymentErrors = Record<string, string>;

const fieldClassName =
  "h-12 rounded-2xl border-border-warm bg-ivory px-4 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20";

function PaymentError({ message }: { message?: string }): ReactElement | null {
  if (!message) return null;

  return <p className="font-dm-sans text-caption text-error">{message}</p>;
}

export default function PaymentMethod({
  onSubmit,
  defaultMethod = "mpesa",
}: PaymentMethodProps): ReactElement {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(defaultMethod);
  const [mpesaPhone, setMpesaPhone] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [nameOnCard, setNameOnCard] = useState<string>("");
  const [errors, setErrors] = useState<PaymentErrors>({});

  function chooseMethod(method: PaymentMethodType): void {
    setSelectedMethod(method);
    setErrors({});
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nextErrors: PaymentErrors = {};

    if (selectedMethod === "mpesa" && !mpesaPhone.trim()) {
      nextErrors.mpesaPhone = "Add the number that should receive the prompt.";
    }

    if (selectedMethod === "card") {
      if (!cardNumber.trim()) nextErrors.cardNumber = "Add your card number.";
      if (!expiry.trim()) nextErrors.expiry = "Add the expiry date.";
      if (!cvv.trim()) nextErrors.cvv = "Add the CVV.";
      if (!nameOnCard.trim()) nextErrors.nameOnCard = "Add the cardholder name.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit(selectedMethod);
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
          Choose the way you want to pay.
        </h2>
        <p className="font-dm-sans text-body-sm text-text-secondary">
          M-Pesa leads, because checkout should feel familiar.
        </p>
      </div>

      <div className="space-y-4">
        <button
          className={cn(
            "w-full rounded-2xl border p-5 text-left transition-colors",
            selectedMethod === "mpesa"
              ? "border-gold bg-cream"
              : "border-border-warm bg-ivory hover:border-gold/60",
          )}
          onClick={(): void => chooseMethod("mpesa")}
          type="button"
        >
          <div className="flex items-start gap-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-obsidian text-gold">
              <Smartphone className="size-5" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-dm-sans text-body-sm font-medium text-obsidian">
                Pay with M-Pesa
              </p>
              <p className="font-dm-sans text-body-sm text-text-secondary">
                Enter your Safaricom number and confirm the payment prompt.
              </p>
            </div>
          </div>

          {selectedMethod === "mpesa" ? (
            <div className="mt-4 space-y-2">
              <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="mpesaPhone">
                M-Pesa Phone Number
              </Label>
              <Input
                className={fieldClassName}
                id="mpesaPhone"
                onChange={(event): void => setMpesaPhone(event.target.value)}
                placeholder="+254 XXX XXX XXX"
                value={mpesaPhone}
              />
              <p className="font-dm-sans text-caption text-text-muted">
                You will receive a payment prompt on your phone.
              </p>
              <PaymentError message={errors.mpesaPhone} />
            </div>
          ) : null}
        </button>

        <button
          className={cn(
            "w-full rounded-2xl border p-5 text-left transition-colors",
            selectedMethod === "card"
              ? "border-gold bg-cream"
              : "border-border-warm bg-ivory hover:border-gold/60",
          )}
          onClick={(): void => chooseMethod("card")}
          type="button"
        >
          <div className="flex items-start gap-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-obsidian text-gold">
              <CreditCard className="size-5" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-dm-sans text-body-sm font-medium text-obsidian">
                Pay with Card
              </p>
              <p className="font-dm-sans text-body-sm text-text-secondary">
                Secure checkout for Visa and Mastercard.
              </p>
            </div>
          </div>

          {selectedMethod === "card" ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="cardNumber">
                  Card Number
                </Label>
                <Input
                  className={fieldClassName}
                  id="cardNumber"
                  onChange={(event): void => setCardNumber(event.target.value)}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                />
                <PaymentError message={errors.cardNumber} />
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="expiry">
                  Expiry
                </Label>
                <Input
                  className={fieldClassName}
                  id="expiry"
                  onChange={(event): void => setExpiry(event.target.value)}
                  placeholder="MM/YY"
                  value={expiry}
                />
                <PaymentError message={errors.expiry} />
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="cvv">
                  CVV
                </Label>
                <Input
                  className={fieldClassName}
                  id="cvv"
                  onChange={(event): void => setCvv(event.target.value)}
                  placeholder="123"
                  value={cvv}
                />
                <PaymentError message={errors.cvv} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="font-dm-sans text-body-sm text-obsidian" htmlFor="nameOnCard">
                  Name on Card
                </Label>
                <Input
                  className={fieldClassName}
                  id="nameOnCard"
                  onChange={(event): void => setNameOnCard(event.target.value)}
                  placeholder="Amina Wanjiru"
                  value={nameOnCard}
                />
                <PaymentError message={errors.nameOnCard} />
              </div>
            </div>
          ) : null}
        </button>

        <button
          className={cn(
            "w-full rounded-2xl border p-5 text-left transition-colors",
            selectedMethod === "cash-on-delivery"
              ? "border-gold bg-cream"
              : "border-border-warm bg-ivory hover:border-gold/60",
          )}
          onClick={(): void => chooseMethod("cash-on-delivery")}
          type="button"
        >
          <div className="flex items-start gap-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-obsidian text-gold">
              <Banknote className="size-5" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-dm-sans text-body-sm font-medium text-obsidian">
                Cash on Delivery
              </p>
              <p className="font-dm-sans text-body-sm text-text-secondary">
                Pay when your order arrives. Available within Nairobi only.
              </p>
            </div>
          </div>

          {selectedMethod === "cash-on-delivery" ? (
            <p className="mt-4 font-dm-sans text-body-sm text-text-secondary">
              Keep your phone close. Our rider will call before arrival.
            </p>
          ) : null}
        </button>
      </div>

      <Button
        className="h-12 w-full rounded-full bg-gold font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
        type="submit"
      >
        Continue to Review
      </Button>
    </form>
  );
}
