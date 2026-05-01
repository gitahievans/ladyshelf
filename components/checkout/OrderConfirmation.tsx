"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { scaleInVariant } from "@/lib/utils/animations";
import { formatPrice } from "@/lib/utils/format";
import { isOrderEligibleForSasaPayRetry } from "@/lib/utils/orderPayments";
import type { Order } from "@/lib/types";

interface OrderConfirmationProps {
  order: Order;
  onRetryPayment?: () => void;
  paymentActionError?: string | null;
  isRetryingPayment?: boolean;
}

function getPaymentLabel(method: Order["paymentMethod"]): string {
  if (method === "mpesa") return "M-Pesa";

  return "Card";
}

function getOrderHeadline(order: Order): string {
  if (order.deliveryMode === "pickup") {
    if (order.orderStatus === "awaiting_payment") {
      return "Pickup Reserved.";
    }

    return "Pickup Confirmed.";
  }

  if (order.orderStatus === "awaiting_payment") {
    return "Order Reserved.";
  }

  return "Order Confirmed.";
}

function getOrderMessage(order: Order): string {
  if (order.deliveryMode === "pickup") {
    if (order.paymentStatus === "paid") {
      return "Your payment has been received. Your piece will be prepared for store pickup in Roysambu.";
    }

    return "Your pickup request has been created. Complete payment to confirm your store pickup.";
  }

  if (order.deliveryMode === "parcel" && order.paymentStatus === "paid") {
    return "Your payment has been received. A store attendant will contact you to arrange parcel dispatch.";
  }

  if (order.paymentTiming === "pay_on_delivery") {
    return "Your order is logged and will be prepared for rider dispatch.";
  }

  return "Your order has been created. Payment confirmation is the next step before we prepare it.";
}

function getStatusLabel(value: string): string {
  return value.replaceAll("_", " ");
}

export default function OrderConfirmation({
  order,
  onRetryPayment,
  paymentActionError,
  isRetryingPayment = false,
}: OrderConfirmationProps): ReactElement {
  const reducedMotion = useReducedMotion();
  const isGuest = !order.userId;
  const shouldOfferPaymentRetry =
    !order.manualDeliveryFeeConfirmationRequired &&
    isOrderEligibleForSasaPayRetry(order) &&
    typeof onRetryPayment === "function";

  return (
    <div className="space-y-8 rounded-[28px] border border-border-warm bg-cream p-6 text-center shadow-card sm:p-10">
      <motion.div
        animate="visible"
        className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-gold text-obsidian"
        initial="hidden"
        variants={
          reducedMotion
            ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
            : scaleInVariant
        }
      >
        <Check className="size-9" />
      </motion.div>

      <div className="space-y-3">
        <h2 className="font-cormorant text-display-sm text-obsidian">
          {getOrderHeadline(order)}
        </h2>
        <p className="font-dm-sans text-body text-text-secondary">
          {getOrderMessage(order)}
        </p>
        <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
          {order.orderNumber}
        </p>
      </div>

      <div className="grid gap-4 text-left md:grid-cols-2">
        <section className="rounded-2xl border border-border-warm bg-ivory p-5">
          <h3 className="font-cormorant text-h4 text-obsidian">
            {order.deliveryMode === "pickup" ? "Pickup Details" : "Delivery"}
          </h3>
          <div className="mt-3 space-y-1 font-dm-sans text-body-sm text-text-secondary">
            <p className="text-obsidian">{order.deliveryDetails.fullName}</p>
            <p>{order.deliveryDetails.phone}</p>
            {order.deliveryMode === "pickup" ? (
              <>
                <p>{order.pickupInstructions?.streetAddress}</p>
                <p>
                  {order.pickupInstructions?.town}, {order.pickupInstructions?.county}
                </p>
                <p>
                  Collect within {order.pickupInstructions?.collectionWindowHours ?? 72} hours
                  after confirmation.
                </p>
                {order.pickupInstructions?.mapsUrl ? (
                  <Link
                    className="inline-flex items-center gap-2 font-medium text-gold transition-colors hover:text-bark"
                    href={order.pickupInstructions.mapsUrl}
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
                  {order.deliveryDetails.streetAddress}, {order.deliveryDetails.town},{" "}
                  {order.deliveryDetails.county}
                </p>
                <p>
                  {order.deliveryMode === "parcel"
                    ? "A store attendant will contact you to arrange parcel dispatch."
                    : "Expected delivery: 2-3 business days"}
                </p>
              </>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border-warm bg-ivory p-5">
          <h3 className="font-cormorant text-h4 text-obsidian">Order Summary</h3>
          <div className="mt-3 space-y-1 font-dm-sans text-body-sm text-text-secondary">
            <p>{order.items.length} pieces in this order</p>
            <p>
              Payment:{" "}
              {order.paymentTiming === "pay_on_delivery"
                ? "M-Pesa on Delivery"
                : getPaymentLabel(order.paymentMethod)}
            </p>
            <p>Status: {getStatusLabel(order.orderStatus)}</p>
            <p>Payment status: {getStatusLabel(order.paymentStatus)}</p>
            <p className="text-obsidian">
              {formatPrice(order.total, order.currency)}
            </p>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {shouldOfferPaymentRetry ? (
          <Button
            className="h-12 rounded-full bg-gold px-6 font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
            disabled={isRetryingPayment}
            onClick={onRetryPayment}
          >
            {isRetryingPayment ? "Restarting Payment..." : "Try Payment Again"}
          </Button>
        ) : null}
        {order.userId ? (
          <Button
            asChild
            className="h-12 rounded-full border border-bark/20 bg-transparent px-6 font-dm-sans text-body-sm font-medium text-obsidian hover:border-gold hover:bg-ivory"
            variant="ghost"
          >
            <Link href="/account">View Your Orders</Link>
          </Button>
        ) : null}
        <Button
          asChild
          className="h-12 rounded-full bg-gold px-6 font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
        >
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>

      {paymentActionError ? (
        <div className="rounded-2xl border border-destructive/20 bg-ivory p-5 text-left">
          <p className="font-dm-sans text-body-sm text-destructive">{paymentActionError}</p>
        </div>
      ) : null}

      {isGuest ? (
        <div className="rounded-2xl border border-bark/20 bg-ivory p-5">
          <p className="font-dm-sans text-body-sm text-text-secondary">
            Your email confirmation is on the way. Save time next time.{" "}
            <Link className="font-medium text-gold transition-colors hover:text-bark" href="/auth/register">
              Join Wahi
            </Link>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}
