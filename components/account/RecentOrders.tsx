import type { ReactElement } from "react";
import Link from "next/link";

import PriceDisplay from "@/components/shared/PriceDisplay";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Order } from "@/lib/types";

interface RecentOrdersProps {
  orders: Order[];
}

const statusTone: Record<Order["orderStatus"], string> = {
  pending: "text-warning",
  confirmed: "text-gold",
  processing: "text-bark",
  shipped: "text-success",
  delivered: "text-obsidian",
  cancelled: "text-error",
};

export default function RecentOrders({
  orders,
}: RecentOrdersProps): ReactElement {
  return (
    <section className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-dm-sans text-label uppercase tracking-[0.16em] text-gold">
            Order Desk
          </p>
          <h2 className="font-cormorant text-h3 text-obsidian">Recent Orders</h2>
        </div>
        <Link
          className="font-dm-sans text-body-sm text-bark transition-colors hover:text-obsidian"
          href="/shop"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article
            className="rounded-md border border-border-warm bg-ivory p-4"
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
                  {order.orderStatus}
                </p>
                <PriceDisplay price={order.total} size="md" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
