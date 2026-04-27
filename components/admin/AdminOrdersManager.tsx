"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";

import AdminStatus from "@/components/admin/AdminStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchAdminOrders } from "@/lib/api/admin";
import { formatDate, formatPrice } from "@/lib/utils/format";
import type { AdminOrderListItem, CheckoutDeliveryMode, OrderStatus, PaymentStatus } from "@/lib/types";

const orderStatuses: Array<{ label: string; value: OrderStatus | "" }> = [
  { label: "All order statuses", value: "" },
  { label: "New", value: "new" },
  { label: "Awaiting Payment", value: "awaiting_payment" },
  { label: "Paid", value: "paid" },
  { label: "Awaiting Delivery Fee", value: "awaiting_delivery_fee_confirmation" },
  { label: "Ready for Dispatch", value: "ready_for_dispatch" },
  { label: "Out for Delivery", value: "out_for_delivery" },
  { label: "Ready for Pickup", value: "ready_for_pickup" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const paymentStatuses: Array<{ label: string; value: PaymentStatus | "" }> = [
  { label: "All payment statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Manual on Delivery", value: "manual_on_delivery" },
  { label: "Refunded", value: "refunded" },
];

const deliveryModes: Array<{ label: string; value: CheckoutDeliveryMode | "" }> = [
  { label: "All delivery modes", value: "" },
  { label: "Rider", value: "rider" },
  { label: "Parcel", value: "parcel" },
  { label: "Pickup", value: "pickup" },
];

function paymentTone(status: PaymentStatus): "neutral" | "success" | "warning" | "error" {
  if (status === "paid") return "success";
  if (status === "failed" || status === "refunded") return "error";
  if (status === "pending") return "warning";
  return "neutral";
}

export default function AdminOrdersManager(): ReactElement {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [query, setQuery] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [deliveryMode, setDeliveryMode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const nextOrders = await fetchAdminOrders({
        q: query,
        orderStatus,
        paymentStatus,
        deliveryMode,
      });
      setOrders(nextOrders);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load orders.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect((): void => {
    void loadOrders();
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
        <h2 className="mt-2 font-cormorant text-h2 text-obsidian">
          Order operations
        </h2>
        <p className="mt-3 max-w-3xl font-dm-sans text-body-sm text-text-secondary">
          Search and filter the operational queue, then open an order to update
          its status, payment state, or internal notes.
        </p>
      </div>

      <div className="grid gap-3 rounded-lg border border-border-warm bg-ivory p-4 shadow-card lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search order, customer, or guest email"
            className="h-11 rounded-sm border-border-warm bg-cream px-4 font-dm-sans text-body-sm"
          />
        </div>
        <select className="h-11 rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm" value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)}>
          {orderStatuses.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
        </select>
        <select className="h-11 rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
          {paymentStatuses.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
        </select>
        <div className="flex gap-2">
          <select className="h-11 min-w-0 flex-1 rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm" value={deliveryMode} onChange={(event) => setDeliveryMode(event.target.value)}>
            {deliveryModes.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
          </select>
          <Button type="button" onClick={() => void loadOrders()} className="h-11 rounded-sm bg-gold px-4 text-obsidian hover:bg-sand">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-error bg-ivory p-4 font-dm-sans text-body-sm text-error">{error}</div> : null}

      <div className="overflow-hidden rounded-lg border border-border-warm bg-ivory shadow-card">
        {isLoading ? (
          <div className="flex items-center gap-3 p-6 font-dm-sans text-body text-text-secondary"><Loader2 className="h-4 w-4 animate-spin" />Loading orders...</div>
        ) : orders.length === 0 ? (
          <p className="p-6 font-dm-sans text-body text-text-secondary">No orders match this view.</p>
        ) : (
          <div>
            <div className="hidden grid-cols-6 gap-3 border-b border-border-warm bg-cream px-5 py-3 font-dm-sans text-caption uppercase tracking-widest text-text-muted md:grid">
              <span className="col-span-2">Order / Customer</span>
              <span>Order Status</span>
              <span>Payment</span>
              <span>Date</span>
              <span className="text-right">Total</span>
            </div>
            <div className="divide-y divide-border-warm">
            {orders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.orderNumber}`} className="grid gap-3 p-5 transition-colors hover:bg-cream md:grid-cols-6 md:items-center">
                <div className="md:col-span-2">
                  <p className="font-dm-sans text-body-sm font-semibold text-obsidian">{order.orderNumber}</p>
                  <p className="font-dm-sans text-caption text-text-muted">{order.customerLabel || "Guest customer"}</p>
                </div>
                <AdminStatus value={order.orderStatus} />
                <AdminStatus value={order.paymentStatus} tone={paymentTone(order.paymentStatus)} />
                <p className="font-dm-sans text-body-sm text-text-secondary">{formatDate(order.createdAt)}</p>
                <p className="font-dm-sans text-body-sm font-semibold text-obsidian md:text-right">{formatPrice(order.total, order.currency)}</p>
              </Link>
            ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
