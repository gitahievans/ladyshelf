"use client";

import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";

import AdminDetailRow from "@/components/admin/AdminDetailRow";
import AdminManualPaymentPanel from "@/components/admin/AdminManualPaymentPanel";
import AdminOrderReceiptPanel from "@/components/admin/AdminOrderReceiptPanel";
import AdminStatus from "@/components/admin/AdminStatus";
import { Button } from "@/components/ui/button";
import {
  fetchAdminOrderDetail,
  markAdminOrderPaid,
  resendAdminOrderReceipt,
  updateAdminOrder,
} from "@/lib/api/admin";
import { formatDate, formatPrice } from "@/lib/utils/format";
import type { AdminOrderDetail, OrderStatus, PaymentStatus } from "@/lib/types";

const orderStatusOptions: OrderStatus[] = ["new", "awaiting_payment", "paid", "awaiting_delivery_fee_confirmation", "ready_for_dispatch", "out_for_delivery", "ready_for_pickup", "completed", "cancelled"];
const paymentStatusOptions: PaymentStatus[] = ["pending", "paid", "failed", "manual_on_delivery", "refunded"];

interface AdminOrderDetailManagerProps {
  orderNumber: string;
}

function formatLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdminOrderDetailManager({ orderNumber }: AdminOrderDetailManagerProps): ReactElement {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("new");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [internalNotes, setInternalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isResendingReceipt, setIsResendingReceipt] = useState(false);
  const [amountCollected, setAmountCollected] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [staffNote, setStaffNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadOrder = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const nextOrder = await fetchAdminOrderDetail(orderNumber);
      setOrder(nextOrder);
      setOrderStatus(nextOrder.orderStatus);
      setPaymentStatus(nextOrder.paymentStatus);
      setInternalNotes(nextOrder.internalNotes);
      setAmountCollected(String(nextOrder.total));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load order.");
    } finally {
      setIsLoading(false);
    }
  }, [orderNumber]);

  useEffect((): void => {
    void loadOrder();
  }, [loadOrder]);

  async function handleSave(): Promise<void> {
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await updateAdminOrder({
        orderNumber,
        input: { orderStatus, paymentStatus, internalNotes },
      });
      setOrder(updated);
      setMessage("Order updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update order.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMarkPaid(): Promise<void> {
    const parsedAmount = Number.parseInt(amountCollected, 10);

    setIsMarkingPaid(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await markAdminOrderPaid({
        orderNumber,
        input: {
          amountCollected: Number.isFinite(parsedAmount) ? parsedAmount : undefined,
          paymentMethod: "mpesa",
          paymentReference,
          staffNote,
        },
      });
      setOrder(updated);
      setOrderStatus(updated.orderStatus);
      setPaymentStatus(updated.paymentStatus);
      setInternalNotes(updated.internalNotes);
      setMessage("Payment marked as paid and the receipt email has been queued.");
    } catch (markPaidError) {
      setError(markPaidError instanceof Error ? markPaidError.message : "Unable to mark order as paid.");
    } finally {
      setIsMarkingPaid(false);
    }
  }

  async function handleResendReceipt(): Promise<void> {
    setIsResendingReceipt(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await resendAdminOrderReceipt(orderNumber);
      setOrder(updated);
      setMessage("Receipt resent.");
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "Unable to resend receipt.");
    } finally {
      setIsResendingReceipt(false);
    }
  }

  if (isLoading) {
    return <div className="flex items-center gap-3 rounded-lg border border-border-warm bg-ivory p-6 font-dm-sans text-body text-text-secondary"><Loader2 className="h-4 w-4 animate-spin" />Loading order...</div>;
  }

  if (!order) {
    return <div className="rounded-lg border border-error bg-ivory p-6 font-dm-sans text-body text-error">{error ?? "Order not found."}</div>;
  }

  const canMarkPaid =
    order.paymentTiming === "pay_on_delivery" && order.paymentStatus !== "paid";

  return (
    <section className="space-y-6">
      <Link href="/admin/orders" className="font-dm-sans text-body-sm text-gold hover:text-bark">Back to orders</Link>
      <div className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
        <p className="font-dm-sans text-label uppercase tracking-widest text-gold">Order Detail</p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-cormorant text-h2 text-obsidian">{order.orderNumber}</h2>
            <p className="font-dm-sans text-body text-text-secondary">{formatDate(order.createdAt)} · {formatPrice(order.total, order.currency)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminStatus value={order.orderStatus} />
            <AdminStatus value={order.paymentStatus} tone={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "failed" ? "error" : "warning"} />
          </div>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-error bg-ivory p-4 font-dm-sans text-body-sm text-error">{error}</div> : null}
      {message ? <div className="rounded-lg border border-success bg-ivory p-4 font-dm-sans text-body-sm text-success">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
            <h3 className="font-cormorant text-h4 text-obsidian">Order items</h3>
            <div className="mt-4 divide-y divide-border-warm">
              {order.items.map((item) => (
                <div key={item.id} className="grid gap-2 py-4 md:grid-cols-4 md:items-center">
                  <div className="md:col-span-2">
                    <p className="font-dm-sans text-body-sm font-medium text-obsidian">{item.productName}</p>
                    <p className="font-dm-sans text-caption text-text-muted">{item.size} · {item.color} · Qty {item.quantity}</p>
                  </div>
                  <p className="font-dm-sans text-body-sm text-text-secondary">{item.variantId}</p>
                  <p className="font-dm-sans text-body-sm font-semibold text-obsidian md:text-right">{formatPrice(item.price * item.quantity, item.currency)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
            <h3 className="font-cormorant text-h4 text-obsidian">Payment transactions</h3>
            {order.paymentTransactions.length === 0 ? (
              <p className="mt-3 font-dm-sans text-body text-text-secondary">No payment transactions recorded.</p>
            ) : (
              <div className="mt-4 divide-y divide-border-warm">
                {order.paymentTransactions.map((transaction) => (
                  <div key={transaction.checkoutRequestId || transaction.merchantReference} className="py-4">
                    <p className="font-dm-sans text-body-sm font-medium text-obsidian">{transaction.provider} · {transaction.status}</p>
                    <p className="font-dm-sans text-caption text-text-muted">{transaction.transactionCode || transaction.merchantReference}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <AdminOrderReceiptPanel
            isResendingReceipt={isResendingReceipt}
            onResendReceipt={() => void handleResendReceipt()}
            receipt={order.receipt}
          />
        </div>
        <div className="space-y-6">
          {canMarkPaid ? (
            <AdminManualPaymentPanel
              amountCollected={amountCollected}
              isMarkingPaid={isMarkingPaid}
              onAmountCollectedChange={setAmountCollected}
              onConfirmPayment={() => void handleMarkPaid()}
              onPaymentReferenceChange={setPaymentReference}
              onStaffNoteChange={setStaffNote}
              paymentReference={paymentReference}
              staffNote={staffNote}
            />
          ) : null}
          <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
            <h3 className="font-cormorant text-h4 text-obsidian">Operational updates</h3>
            <label className="mt-4 block font-dm-sans text-label uppercase tracking-widest text-text-secondary">Order status</label>
            <select className="mt-2 h-11 w-full rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm" value={orderStatus} onChange={(event) => setOrderStatus(event.target.value as OrderStatus)}>
              {orderStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <label className="mt-4 block font-dm-sans text-label uppercase tracking-widest text-text-secondary">Payment status</label>
            <select className="mt-2 h-11 w-full rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)}>
              {paymentStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <label className="mt-4 block font-dm-sans text-label uppercase tracking-widest text-text-secondary">Internal notes</label>
            <textarea className="mt-2 min-h-32 w-full rounded-sm border border-border-warm bg-cream px-3 py-3 font-dm-sans text-body-sm outline-none focus:border-gold" value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} />
            <Button type="button" disabled={isSaving} onClick={() => void handleSave()} className="mt-4 h-11 w-full rounded-sm bg-gold font-dm-sans text-body-sm font-medium uppercase tracking-widest text-obsidian hover:bg-sand">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Updates
            </Button>
          </div>
          <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
            <h3 className="font-cormorant text-h4 text-obsidian">Delivery details</h3>
            <div className="mt-4 space-y-3">
              <AdminDetailRow label="Customer" value={order.deliveryDetails.fullName} />
              <AdminDetailRow label="Email" value={order.deliveryDetails.email || order.guestEmail} />
              <AdminDetailRow label="Phone" value={order.deliveryDetails.phone} />
              <AdminDetailRow label="Fulfillment" value={formatLabel(order.deliveryMode)} />
              <AdminDetailRow label="Selected Method" value={formatLabel(order.deliveryDetails.deliveryMethod)} />
              {order.deliveryMode === "pickup" ? (
                <>
                  <AdminDetailRow
                    label="Pickup Address"
                    value={order.pickupInstructions?.streetAddress ?? order.deliveryDetails.streetAddress}
                  />
                  <AdminDetailRow
                    label="Pickup Area"
                    value={`${order.pickupInstructions?.town ?? order.deliveryDetails.town}, ${order.pickupInstructions?.county ?? order.deliveryDetails.county}`}
                  />
                  <AdminDetailRow
                    label="Collection Window"
                    value={
                      order.pickupInstructions
                        ? `${order.pickupInstructions.collectionWindowHours} hours after confirmation`
                        : null
                    }
                  />
                  <AdminDetailRow label="Pickup Contact" value={order.pickupInstructions?.contactPhone} />
                </>
              ) : (
                <>
                  <AdminDetailRow
                    label="Delivery Address"
                    value={`${order.deliveryDetails.streetAddress}, ${order.deliveryDetails.town}, ${order.deliveryDetails.county}`}
                  />
                  <AdminDetailRow label="Location Search Result" value={order.deliveryDetails.locationLabel} />
                  <AdminDetailRow
                    label="Coordinates"
                    value={
                      order.deliveryDetails.latitude != null && order.deliveryDetails.longitude != null
                        ? `${order.deliveryDetails.latitude}, ${order.deliveryDetails.longitude}`
                        : null
                    }
                  />
                </>
              )}
              <AdminDetailRow label="Additional Notes" value={order.deliveryDetails.additionalInfo} />
              <AdminDetailRow
                label="Delivery Fee"
                value={
                  order.manualDeliveryFeeConfirmationRequired
                    ? "To be confirmed by store"
                    : formatPrice(order.deliveryFee, order.currency)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
