"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { scaleInVariant } from "@/lib/utils/animations";
import { formatPrice } from "@/lib/utils/format";
import type { Order } from "@/lib/types";

interface OrderConfirmationProps {
  order: Order;
}

function getPaymentLabel(method: Order["paymentMethod"]): string {
  if (method === "mpesa") return "M-Pesa";
  if (method === "card") return "Card";

  return "Cash on Delivery";
}

export default function OrderConfirmation({
  order,
}: OrderConfirmationProps): ReactElement {
  const reducedMotion = useReducedMotion();
  const isGuest = !order.userId;

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
          Order Confirmed.
        </h2>
        <p className="font-dm-sans text-body text-text-secondary">
          It&apos;s on its way to you.
        </p>
        <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
          {order.orderNumber}
        </p>
      </div>

      <div className="grid gap-4 text-left md:grid-cols-2">
        <section className="rounded-2xl border border-border-warm bg-ivory p-5">
          <h3 className="font-cormorant text-h4 text-obsidian">Delivery</h3>
          <div className="mt-3 space-y-1 font-dm-sans text-body-sm text-text-secondary">
            <p className="text-obsidian">{order.deliveryDetails.fullName}</p>
            <p>
              {order.deliveryDetails.streetAddress}, {order.deliveryDetails.town},{" "}
              {order.deliveryDetails.county}
            </p>
            <p>{order.deliveryDetails.phone}</p>
            <p>Expected delivery: 2-3 business days</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border-warm bg-ivory p-5">
          <h3 className="font-cormorant text-h4 text-obsidian">Order Summary</h3>
          <div className="mt-3 space-y-1 font-dm-sans text-body-sm text-text-secondary">
            <p>{order.items.length} pieces in this order</p>
            <p>Payment: {getPaymentLabel(order.paymentMethod)}</p>
            <p className="text-obsidian">{formatPrice(order.total, order.currency)}</p>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          className="h-12 rounded-full border border-bark/20 bg-transparent px-6 font-dm-sans text-body-sm font-medium text-obsidian hover:border-gold hover:bg-ivory"
          variant="ghost"
        >
          Track Your Order
        </Button>
        <Button
          asChild
          className="h-12 rounded-full bg-gold px-6 font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
        >
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>

      {isGuest ? (
        <div className="rounded-2xl border border-bark/20 bg-ivory p-5">
          <p className="font-dm-sans text-body-sm text-text-secondary">
            Save time next time.{" "}
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
