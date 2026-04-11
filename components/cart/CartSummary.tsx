import type { ReactElement } from "react";
import Link from "next/link";
import { CreditCard, Landmark, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
}

const DELIVERY_THRESHOLD = 5000;
const DELIVERY_FEE = 300;

export default function CartSummary({
  subtotal,
  itemCount,
}: CartSummaryProps): ReactElement {
  const deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  return (
    <aside className="rounded-2xl border border-border-warm bg-cream p-6 shadow-card lg:sticky lg:top-24">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
            Order Summary
          </p>
          <h2 className="font-cormorant text-h2 text-obsidian">
            Ready when you are.
          </h2>
          <p className="font-dm-sans text-body-sm text-text-secondary">
            {itemCount} {itemCount === 1 ? "item" : "items"} selected with
            intention.
          </p>
        </div>

        <div className="space-y-4 font-dm-sans text-body-sm text-text-secondary">
          <div className="flex items-center justify-between gap-4">
            <span>Subtotal</span>
            <span className="font-medium text-obsidian">
              {formatPrice(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Delivery</span>
            {deliveryFee === 0 ? (
              <span className="font-medium text-success">Free</span>
            ) : (
              <span className="font-medium text-obsidian">
                {formatPrice(deliveryFee)}
              </span>
            )}
          </div>
        </div>

        <div className="h-px w-full bg-border-warm" />

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-dm-sans text-caption uppercase tracking-[0.14em] text-text-muted">
              Total
            </p>
            <p className="font-dm-sans text-body-sm text-text-secondary">
              Including delivery
            </p>
          </div>
          <p className="font-dm-sans text-h4 font-semibold text-obsidian">
            {formatPrice(total)}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            asChild
            className="h-12 w-full rounded-full bg-gold font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
          >
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>

          <Button
            asChild
            className="h-12 w-full rounded-full border border-bark/20 bg-transparent font-dm-sans text-body-sm font-medium text-obsidian hover:border-gold hover:bg-ivory"
            variant="ghost"
          >
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>

        <div className="space-y-3">
          <p className="font-dm-sans text-caption uppercase tracking-[0.14em] text-text-muted">
            Accepted payment methods
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-warm bg-ivory px-4 py-2 font-dm-sans text-body-sm text-obsidian">
              <Smartphone className="size-4 text-gold" />
              <span>M-Pesa</span>
            </div>
            <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-warm bg-ivory px-4 py-2 font-dm-sans text-body-sm text-obsidian">
              <CreditCard className="size-4 text-gold" />
              <span>Visa</span>
            </div>
            <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-warm bg-ivory px-4 py-2 font-dm-sans text-body-sm text-obsidian">
              <Landmark className="size-4 text-gold" />
              <span>Mastercard</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
