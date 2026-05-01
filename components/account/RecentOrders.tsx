import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import EmptyState from "@/components/shared/EmptyState";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Order } from "@/lib/types";

interface RecentOrdersProps {
  orders: Order[];
}

const statusTone: Record<Order["orderStatus"], string> = {
  new: "text-gold",
  awaiting_payment: "text-warning",
  paid: "text-success",
  awaiting_delivery_fee_confirmation: "text-bark",
  ready_for_dispatch: "text-gold",
  out_for_delivery: "text-success",
  ready_for_pickup: "text-gold",
  completed: "text-obsidian",
  cancelled: "text-error",
};

function getStatusLabel(order: Order): string {
  if (order.paymentTiming === "prepay" && order.paymentStatus === "pending") {
    return "payment pending";
  }

  if (order.paymentTiming === "prepay" && order.paymentStatus === "paid") {
    if (order.deliveryMode === "pickup") {
      return "ready for pickup";
    }

    return order.deliveryMode === "parcel" ? "paid, dispatch arrangements next" : "paid";
  }

  return order.orderStatus.replaceAll("_", " ");
}

export default function RecentOrders({
  orders,
}: RecentOrdersProps): ReactElement {
  return (
    <section className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-dm-sans text-label uppercase tracking-[0.16em] text-gold">
            Order Desk
          </p>
          <h2 className="font-cormorant text-h3 text-obsidian">Recent Orders</h2>
        </div>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-6 py-3 font-dm-sans text-body-sm font-medium leading-none text-obsidian transition-colors hover:bg-sand"
          href="/shop"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {orders.length === 0 ? (
          <EmptyState
            ctaHref="/shop"
            ctaLabel="Discover New Pieces"
            description="Your orders will appear here as soon as checkout creates them."
            title="No order history yet"
          />
        ) : null}
        {orders.map((order) => (
          <Link
            className="block rounded-md border border-border-warm bg-ivory p-4 transition-colors hover:border-gold hover:bg-cream"
            href={`/account/orders/${order.orderNumber}`}
            key={order.id}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="font-dm-sans text-label uppercase tracking-[0.16em] text-text-muted">
                  {order.orderNumber}
                </p>
                <p className="font-dm-sans text-body-sm text-text-secondary">
                  Ordered on {formatDate(order.createdAt)}
                </p>
                <p className="font-dm-sans text-body-sm text-text-secondary">
                  {order.items.length} {order.items.length === 1 ? "piece" : "pieces"} heading to{" "}
                  {order.deliveryDetails.town}
                </p>
              </div>

              <div className="space-y-2 md:text-right">
                <p
                  className={cn(
                    "font-dm-sans text-caption uppercase tracking-[0.16em]",
                    statusTone[order.orderStatus],
                  )}
                >
                  {getStatusLabel(order)}
                </p>
                <PriceDisplay price={order.total} size="md" />
                <p className="inline-flex items-center gap-2 font-dm-sans text-caption uppercase tracking-[0.16em] text-gold">
                  View order
                  <ArrowRight className="size-3.5" />
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
