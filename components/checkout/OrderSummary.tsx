"use client";

import type { ReactElement } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";
import type {
  CartItem,
  DeliveryDetails,
  PaymentMethod as PaymentMethodType,
} from "@/lib/types";

interface OrderSummaryProps {
  items: CartItem[];
  deliveryDetails: DeliveryDetails;
  paymentMethod: PaymentMethodType;
  subtotal: number;
  deliveryFee: number;
  total: number;
  onEditDelivery: () => void;
  onEditPayment: () => void;
  onPlaceOrder: () => void;
}

function getDeliveryMethodLabel(method: DeliveryDetails["deliveryMethod"]): string {
  return method === "pickup" ? "Pickup from Store" : "Standard Delivery";
}

function getPaymentLabel(method: PaymentMethodType): string {
  if (method === "mpesa") return "M-Pesa";
  if (method === "card") return "Card";

  return "Cash on Delivery";
}

export default function OrderSummary({
  items,
  deliveryDetails,
  paymentMethod,
  subtotal,
  deliveryFee,
  total,
  onEditDelivery,
  onEditPayment,
  onPlaceOrder,
}: OrderSummaryProps): ReactElement {
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
          Review every detail, then place the order with confidence.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            className="flex items-center gap-4 rounded-2xl border border-border-warm bg-ivory p-4"
            key={item.id}
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
              {formatPrice(item.price * item.quantity, item.currency)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        <section className="rounded-2xl border border-border-warm bg-ivory p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-cormorant text-h4 text-obsidian">Delivery</h3>
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
            <p>
              {deliveryDetails.streetAddress}, {deliveryDetails.town},{" "}
              {deliveryDetails.county}
            </p>
            {deliveryDetails.additionalInfo ? (
              <p>{deliveryDetails.additionalInfo}</p>
            ) : null}
            <p className="pt-1 text-obsidian">
              {getDeliveryMethodLabel(deliveryDetails.deliveryMethod)}
            </p>
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
          <p className="mt-3 font-dm-sans text-body-sm text-text-secondary">
            {getPaymentLabel(paymentMethod)}
          </p>
        </section>
      </div>

      <div className="space-y-4 rounded-2xl border border-border-warm bg-ivory p-5">
        <div className="flex items-center justify-between gap-4 font-dm-sans text-body-sm text-text-secondary">
          <span>Subtotal</span>
          <span className="text-obsidian">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 font-dm-sans text-body-sm text-text-secondary">
          <span>Delivery</span>
          <span className={deliveryFee === 0 ? "text-success" : "text-obsidian"}>
            {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
          </span>
        </div>
        <div className="h-px w-full bg-border-warm" />
        <div className="flex items-center justify-between gap-4">
          <span className="font-dm-sans text-body-sm font-medium text-obsidian">
            Total
          </span>
          <span className="font-dm-sans text-h4 font-semibold text-obsidian">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      <Button
        className="h-12 w-full rounded-full bg-gold font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
        onClick={onPlaceOrder}
        type="button"
      >
        Place Order
      </Button>
    </div>
  );
}
