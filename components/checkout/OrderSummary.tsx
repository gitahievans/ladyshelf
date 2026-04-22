"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";
import type {
  CheckoutPaymentSelection,
  CheckoutQuote,
  DeliveryDetails,
} from "@/lib/types";

interface OrderSummaryProps {
  deliveryDetails: DeliveryDetails;
  paymentSelection: CheckoutPaymentSelection;
  quote: CheckoutQuote;
  onEditDelivery: () => void;
  onEditPayment: () => void;
  onPlaceOrder: () => void;
  isSubmitting?: boolean;
  placeOrderError?: string | null;
}

function getDeliveryMethodLabel(method: DeliveryDetails["deliveryMethod"]): string {
  return method === "pickup" ? "Pickup from Store" : "Delivery";
}

function getPaymentLabel(selection: CheckoutPaymentSelection): string {
  if (selection.timing === "pay_on_delivery") {
    return "M-Pesa on Delivery";
  }

  return selection.method === "card" ? "Card" : "M-Pesa";
}

export default function OrderSummary({
  deliveryDetails,
  paymentSelection,
  quote,
  onEditDelivery,
  onEditPayment,
  onPlaceOrder,
  isSubmitting = false,
  placeOrderError = null,
}: OrderSummaryProps): ReactElement {
  const showParcelDeliveryConfirmation = quote.deliveryMode === "parcel";

  return (
    <div className="space-y-8 rounded-[28px] border border-border-warm bg-cream p-6 shadow-card sm:p-8">
      <div className="space-y-2">
        <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
          Step 3
        </p>
        <h2 className="font-cormorant text-h2 text-obsidian">
          One last look before it is yours.
        </h2>
        <p className="font-dm-sans text-body-sm text-text-secondary">
          Review the validated quote, then continue with confidence.
        </p>
      </div>

      <div className="space-y-4">
        {quote.items.map((item) => (
          <div
            className="flex items-center gap-4 rounded-2xl border border-border-warm bg-ivory p-4"
            key={`${item.variantId}-${item.quantity}`}
          >
            <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-sm bg-cream">
              <Image
                alt={item.productName}
                className="object-cover"
                fill
                sizes="64px"
                src={item.productImage}
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <p className="line-clamp-2 font-dm-sans text-body-sm font-medium text-obsidian">
                {item.productName}
              </p>
              <p className="font-dm-sans text-caption uppercase tracking-[0.14em] text-text-muted">
                {item.size} / {item.color} / Qty {item.quantity}
              </p>
            </div>

            <p className="font-dm-sans text-body-sm font-medium text-obsidian">
              {formatPrice(item.lineTotal, item.currency)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        <section className="rounded-2xl border border-border-warm bg-ivory p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-cormorant text-h4 text-obsidian">
              {deliveryDetails.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}
            </h3>
            <button
              className="font-dm-sans text-body-sm font-medium text-gold transition-colors hover:text-bark"
              onClick={onEditDelivery}
              type="button"
            >
              Edit
            </button>
          </div>
          <div className="mt-3 space-y-1 font-dm-sans text-body-sm text-text-secondary">
            <p className="text-obsidian">{deliveryDetails.fullName}</p>
            <p>{deliveryDetails.email}</p>
            <p>{deliveryDetails.phone}</p>
            <p className="text-obsidian">
              {getDeliveryMethodLabel(deliveryDetails.deliveryMethod)}
            </p>
            {deliveryDetails.deliveryMethod === "pickup" ? (
              <>
                <p>{quote.pickupInstructions?.streetAddress}</p>
                <p>
                  {quote.pickupInstructions?.town}, {quote.pickupInstructions?.county}
                </p>
                <p>
                  Collect within {quote.pickupInstructions?.collectionWindowHours ?? 72} hours
                  after confirmation.
                </p>
                {quote.pickupInstructions?.mapsUrl ? (
                  <Link
                    className="inline-flex items-center gap-2 pt-1 font-medium text-gold transition-colors hover:text-bark"
                    href={quote.pickupInstructions.mapsUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open in Google Maps
                    <ExternalLink className="size-4" />
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                <p>
                  {deliveryDetails.streetAddress}, {deliveryDetails.town},{" "}
                  {deliveryDetails.county}
                </p>
                {deliveryDetails.additionalInfo ? <p>{deliveryDetails.additionalInfo}</p> : null}
                <p className="inline-flex items-center gap-2 pt-1 text-obsidian">
                  <MapPin className="size-4 text-gold" />
                  {quote.deliveryMode === "rider"
                    ? "Rider delivery"
                    : "Parcel delivery"}
                </p>
              </>
            )}
            {quote.estimatedWindow ? <p>Estimated timeline: {quote.estimatedWindow}</p> : null}
          </div>
        </section>

        <section className="rounded-2xl border border-border-warm bg-ivory p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-cormorant text-h4 text-obsidian">Payment</h3>
            <button
              className="font-dm-sans text-body-sm font-medium text-gold transition-colors hover:text-bark"
              onClick={onEditPayment}
              type="button"
            >
              Edit
            </button>
          </div>
          <div className="mt-3 space-y-1 font-dm-sans text-body-sm text-text-secondary">
            <p>{getPaymentLabel(paymentSelection)}</p>
            {quote.messages.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-4 rounded-2xl border border-border-warm bg-ivory p-5">
        <div className="flex items-center justify-between gap-4 font-dm-sans text-body-sm text-text-secondary">
          <span>Subtotal</span>
          <span className="text-obsidian">{formatPrice(quote.subtotal, quote.currency)}</span>
        </div>
        {deliveryDetails.deliveryMethod === "delivery" ? (
          <div className="flex items-center justify-between gap-4 font-dm-sans text-body-sm text-text-secondary">
            <span>Delivery</span>
            <span
              className={
                quote.deliveryFee === 0 &&
                !quote.manualDeliveryFeeConfirmationRequired &&
                !showParcelDeliveryConfirmation
                  ? "text-success"
                  : "text-obsidian"
              }
            >
              {quote.manualDeliveryFeeConfirmationRequired || showParcelDeliveryConfirmation
                ? "To Be Confirmed"
                : quote.deliveryFee === 0
                  ? "Free"
                  : formatPrice(quote.deliveryFee, quote.currency)}
            </span>
          </div>
        ) : null}
        <div className="h-px w-full bg-border-warm" />
        <div className="flex items-center justify-between gap-4">
          <span className="font-dm-sans text-body-sm font-medium text-obsidian">
            Total
          </span>
          <span className="font-dm-sans text-h4 font-semibold text-obsidian">
            {quote.manualDeliveryFeeConfirmationRequired || showParcelDeliveryConfirmation
              ? `${formatPrice(quote.subtotal, quote.currency)} + delivery to be confirmed`
              : formatPrice(quote.total, quote.currency)}
          </span>
        </div>
      </div>

      {placeOrderError ? (
        <div className="rounded-2xl border border-error/20 bg-error/10 px-4 py-3">
          <p className="font-dm-sans text-body-sm text-error">{placeOrderError}</p>
        </div>
      ) : null}

      <Button
        className="h-12 w-full rounded-full bg-gold font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
        disabled={isSubmitting}
        onClick={onPlaceOrder}
        type="button"
      >
        {isSubmitting ? "Placing Order..." : "Place Order"}
      </Button>
    </div>
  );
}
