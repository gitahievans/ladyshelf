"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, XCircle } from "lucide-react";

import Footer from "@/components/layout/Footer";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchCatalogProducts } from "@/lib/api/catalog";
import { createSasaPayCheckoutSession, syncSasaPayStatus } from "@/lib/api/checkout";
import { cancelOrderItems, fetchAccountOrders } from "@/lib/api/orders";
import { formatDate } from "@/lib/utils/format";
import { isOrderEligibleForSasaPayRetry } from "@/lib/utils/orderPayments";
import type { CartItem, Order, OrderCancellationReason } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

interface AccountOrderDetailProps {
  orderNumber: string;
}

const cancellationReasons: Array<{
  label: string;
  value: OrderCancellationReason;
}> = [
  { label: "Ordered by mistake", value: "ordered_by_mistake" },
  { label: "Changed my mind", value: "changed_mind" },
  { label: "Need a different size or color", value: "wrong_size_or_color" },
  { label: "Delivery timing no longer works", value: "delivery_timing" },
  { label: "Found another option", value: "found_another_option" },
  { label: "Other", value: "other" },
];

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

export default function AccountOrderDetail({
  orderNumber,
}: AccountOrderDetailProps): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRetryingPayment, setIsRetryingPayment] = useState<boolean>(false);
  const [paymentActionError, setPaymentActionError] = useState<string>("");
  const [itemToCancel, setItemToCancel] = useState<CartItem | null>(null);
  const [cancellationQuantity, setCancellationQuantity] = useState<string>("1");
  const [cancellationReason, setCancellationReason] = useState<OrderCancellationReason | "">("");
  const [cancellationNote, setCancellationNote] = useState<string>("");
  const [cancellationError, setCancellationError] = useState<string>("");
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [isReordering, setIsReordering] = useState<boolean>(false);
  const [reorderError, setReorderError] = useState<string>("");

  const order = useMemo(
    () => orders.find((entry) => entry.orderNumber === orderNumber) ?? null,
    [orderNumber, orders],
  );
  const paymentReturnState = searchParams.get("payment");

  useEffect((): (() => void) | void => {
    if (!isInitialized || !isAuthenticated) {
      return;
    }

    let isMounted = true;

    void (async (): Promise<void> => {
      try {
        setIsLoading(true);
        const nextOrders = await fetchAccountOrders();

        if (!isMounted) {
          return;
        }

        setOrders(nextOrders);
      } finally {
        if (!isMounted) {
          return;
        }

        setIsLoading(false);
      }
    })();

    return (): void => {
      isMounted = false;
    };
  }, [isAuthenticated, isInitialized]);

  useEffect((): void => {
    if (!paymentReturnState || !order) {
      return;
    }

    void (async (): Promise<void> => {
      try {
        setPaymentActionError("");
        const paymentState = await syncSasaPayStatus({ orderNumber: order.orderNumber });
        setOrders((current) =>
          current.map((entry) =>
            entry.orderNumber === paymentState.order.orderNumber ? paymentState.order : entry,
          ),
        );
      } catch (error) {
        setPaymentActionError(
          error instanceof Error
            ? error.message
            : "We could not refresh your payment status yet.",
        );
      } finally {
        router.replace(`/account/orders/${encodeURIComponent(orderNumber)}`);
      }
    })();
  }, [order, orderNumber, paymentReturnState, router]);

  async function handleRetryPayment(): Promise<void> {
    if (!order) {
      return;
    }

    setIsRetryingPayment(true);
    setPaymentActionError("");

    try {
      const baseUrl = window.location.origin;
      const paymentSession = await createSasaPayCheckoutSession({
        orderNumber: order.orderNumber,
        redirectUrl: `${baseUrl}/account/orders/${encodeURIComponent(order.orderNumber)}?payment=return`,
        successUrl: `${baseUrl}/account/orders/${encodeURIComponent(order.orderNumber)}?payment=success`,
        failureUrl: `${baseUrl}/account/orders/${encodeURIComponent(order.orderNumber)}?payment=failed`,
      });

      window.location.assign(paymentSession.transaction.checkoutUrl);
    } catch (error) {
      setPaymentActionError(
        error instanceof Error
          ? error.message
          : "We could not open the payment page right now.",
      );
      setIsRetryingPayment(false);
    }
  }

  async function handleReorder(): Promise<void> {
    if (!order) {
      return;
    }

    setIsReordering(true);
    setReorderError("");

    const liveProducts = await fetchCatalogProducts();

    if (liveProducts.length === 0) {
      setReorderError("We could not confirm live stock right now.");
      setIsReordering(false);
      return;
    }

    const reorderableItems = order.items.flatMap((item) => {
      const product = liveProducts.find((entry) => entry.id === item.productId);
      const variant = product?.variants.find((entry) => entry.id === item.variantId);

      if (!product || !variant || variant.stock <= 0) {
        return [];
      }

      return [
        {
          ...item,
          id: crypto.randomUUID(),
          productId: product.id,
          productImage: product.images[0] ?? item.productImage,
          productName: product.name,
          price: product.price,
          quantity: Math.min(item.quantity, variant.stock),
          variantId: variant.id,
        },
      ];
    });

    if (reorderableItems.length === 0) {
      setReorderError("None of these items are currently available to add back to your bag.");
      setIsReordering(false);
      return;
    }

    clearCart();
    reorderableItems.forEach((item) => addItem(item));
    setIsReordering(false);
    router.push("/cart");
  }

  function openCancellationDialog(item: CartItem): void {
    setItemToCancel(item);
    setCancellationQuantity("1");
    setCancellationReason("");
    setCancellationNote("");
    setCancellationError("");
  }

  function closeCancellationDialog(): void {
    if (isCancelling) {
      return;
    }

    setItemToCancel(null);
    setCancellationError("");
  }

  async function handleCancelItem(): Promise<void> {
    if (!order || !itemToCancel || !cancellationReason) {
      setCancellationError("Choose a reason before submitting your cancellation.");
      return;
    }

    const quantity = Number.parseInt(cancellationQuantity, 10);
    if (!Number.isFinite(quantity) || quantity < 1) {
      setCancellationError("Choose a valid quantity to cancel.");
      return;
    }

    setIsCancelling(true);
    setCancellationError("");

    try {
      const updatedOrder = await cancelOrderItems({
        orderNumber: order.orderNumber,
        items: [{ orderItemId: itemToCancel.id, quantity }],
        reason: cancellationReason,
        note: cancellationNote,
      });
      setOrders((current) =>
        current.map((entry) =>
          entry.orderNumber === updatedOrder.orderNumber ? updatedOrder : entry,
        ),
      );
      setItemToCancel(null);
    } catch (error) {
      setCancellationError(
        error instanceof Error ? error.message : "We could not cancel this item right now.",
      );
    } finally {
      setIsCancelling(false);
    }
  }

  if (!isInitialized || isLoading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-ivory px-6">
        <LoadingSpinner size="lg" />
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <section className="bg-ivory px-6 py-12 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-container">
            <EmptyState
              ctaHref="/auth/login"
              ctaLabel="Sign In"
              description="Please sign in to view your order details and payment updates."
              title="Your order history is available in your account"
            />
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <section className="bg-ivory px-6 py-12 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-container">
            <EmptyState
              ctaHref="/account"
              ctaLabel="Back to Account"
              description="We could not find that order in your account history."
              title="Order not found"
            />
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <section className="bg-ivory px-6 py-10 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-container space-y-8">
          <div className="space-y-4">
            <nav className="flex items-center gap-2 font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
              <Link className="transition-colors hover:text-obsidian" href="/">
                Home
              </Link>
              <span>/</span>
              <Link className="transition-colors hover:text-obsidian" href="/account">
                Account
              </Link>
              <span>/</span>
              <span className="text-obsidian">{order.orderNumber}</span>
            </nav>
            <div className="space-y-3">
              <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
                Order Details
              </p>
              <h1 className="font-cormorant text-h1 text-obsidian lg:text-display-lg">
                {order.orderNumber}
              </h1>
              <p className="font-dm-sans text-body text-text-secondary">
                Ordered on {formatDate(order.createdAt)}. Current status: {getStatusLabel(order)}.
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_340px]">
            <div className="space-y-6">
              <section className="rounded-[28px] border border-border-warm bg-cream p-6 shadow-card">
                <div className="space-y-2">
                  <p className="font-dm-sans text-label uppercase tracking-[0.16em] text-gold">
                    Pieces
                  </p>
                  <h2 className="font-cormorant text-h3 text-obsidian">Items in this order</h2>
                </div>

                <div className="mt-6 space-y-4">
                  {order.items.map((item) => {
                    const cancelledQuantity = item.cancelledQuantity ?? 0;
                    const cancellableQuantity = item.cancellableQuantity ?? item.quantity;
                    const activeQuantity = item.quantity - cancelledQuantity;
                    const canCancelItem = Boolean(order.canCancel) && cancellableQuantity > 0;

                    return (
                      <div
                        className="grid gap-4 rounded-2xl border border-border-warm bg-ivory p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
                        key={item.id}
                      >
                        <div className="space-y-2">
                          <p className="font-dm-sans text-body-sm font-medium text-obsidian">
                            {item.productName}
                          </p>
                          <p className="font-dm-sans text-caption uppercase tracking-[0.14em] text-text-muted">
                            {item.size} / {item.color}
                          </p>
                          <div className="space-y-1 font-dm-sans text-body-sm text-text-secondary">
                            <p>Ordered quantity: {item.quantity}</p>
                            <p>Remaining quantity: {activeQuantity}</p>
                            {cancelledQuantity > 0 ? (
                              <p className="text-error">Cancelled quantity: {cancelledQuantity}</p>
                            ) : null}
                          </div>
                          {canCancelItem ? (
                            <Button
                              className="h-10 rounded-full border border-error/30 bg-transparent px-4 font-dm-sans text-body-sm font-medium text-error hover:border-error hover:bg-error/10"
                              onClick={(): void => openCancellationDialog(item)}
                              type="button"
                              variant="ghost"
                            >
                              <XCircle className="mr-2 size-4" />
                              Cancel item
                            </Button>
                          ) : null}
                        </div>
                        <PriceDisplay
                          currency={item.currency}
                          price={item.price * activeQuantity}
                          size="sm"
                        />
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="grid gap-6 xl:grid-cols-2">
                <section className="rounded-[28px] border border-border-warm bg-cream p-6 shadow-card">
                  <p className="font-dm-sans text-label uppercase tracking-[0.16em] text-gold">
                    Delivery
                  </p>
                  <div className="mt-4 space-y-2 font-dm-sans text-body-sm text-text-secondary">
                    <p className="font-medium text-obsidian">{order.deliveryDetails.fullName}</p>
                    <p>{order.deliveryDetails.phone}</p>
                    <p>{order.deliveryDetails.email}</p>
                    <p>
                      {order.deliveryDetails.streetAddress}, {order.deliveryDetails.town},{" "}
                      {order.deliveryDetails.county}
                    </p>
                    {order.deliveryMode === "pickup" && order.pickupInstructions?.mapsUrl ? (
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
                  </div>
                </section>

                <section className="rounded-[28px] border border-border-warm bg-cream p-6 shadow-card">
                  <p className="font-dm-sans text-label uppercase tracking-[0.16em] text-gold">
                    Payment
                  </p>
                  <div className="mt-4 space-y-2 font-dm-sans text-body-sm text-text-secondary">
                    <p>Method: {order.paymentMethod === "mpesa" ? "M-Pesa" : "Card"}</p>
                    <p>Timing: {order.paymentTiming === "prepay" ? "Prepay" : "Pay on delivery"}</p>
                    <p>Status: {order.paymentStatus.replaceAll("_", " ")}</p>
                    <p>Order status: {order.orderStatus.replaceAll("_", " ")}</p>
                    <div className="font-medium text-obsidian">
                      <PriceDisplay currency={order.currency} price={order.total} size="md" />
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <aside className="rounded-[28px] border border-border-warm bg-cream p-6 shadow-card lg:sticky lg:top-24">
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="font-dm-sans text-label uppercase tracking-[0.16em] text-gold">
                    Next Step
                  </p>
                  <h2 className="font-cormorant text-h3 text-obsidian">Manage this order</h2>
                </div>

                <div className="space-y-3">
                  {isOrderEligibleForSasaPayRetry(order) ? (
                    <Button
                      className="h-12 w-full rounded-full bg-gold font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
                      disabled={isRetryingPayment}
                      onClick={(): void => {
                        void handleRetryPayment();
                      }}
                      type="button"
                    >
                      {isRetryingPayment ? "Opening SasaPay..." : "Retry Payment"}
                    </Button>
                  ) : null}

                  <Button
                    className="h-12 w-full rounded-full border border-bark/20 bg-transparent font-dm-sans text-body-sm font-medium text-obsidian hover:border-gold hover:bg-ivory"
                    disabled={isReordering}
                    onClick={(): void => {
                      void handleReorder();
                    }}
                    type="button"
                    variant="ghost"
                  >
                    {isReordering ? "Checking Stock..." : "Order Again"}
                  </Button>

                  <Button
                    asChild
                    className="h-12 w-full rounded-full border border-bark/20 bg-transparent font-dm-sans text-body-sm font-medium text-obsidian hover:border-gold hover:bg-ivory"
                    variant="ghost"
                  >
                    <Link href="/account">Back to Account</Link>
                  </Button>
                </div>

                {paymentActionError ? (
                  <div className="rounded-2xl border border-error/20 bg-ivory p-4">
                    <p className="font-dm-sans text-body-sm text-error">{paymentActionError}</p>
                  </div>
                ) : null}

                {reorderError ? (
                  <div className="rounded-2xl border border-error/20 bg-ivory p-4">
                    <p className="font-dm-sans text-body-sm text-error">{reorderError}</p>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Dialog open={itemToCancel !== null} onOpenChange={(open): void => {
        if (!open) closeCancellationDialog();
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border border-border-warm bg-cream p-6 text-obsidian shadow-card sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-cormorant text-h3 text-obsidian">
              Cancel item
            </DialogTitle>
            <DialogDescription className="font-dm-sans text-body-sm text-text-secondary">
              Choose how many pieces to cancel. We will email you once the cancellation is confirmed.
            </DialogDescription>
          </DialogHeader>

          {itemToCancel ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-border-warm bg-ivory p-4">
                <p className="font-dm-sans text-body-sm font-medium text-obsidian">
                  {itemToCancel.productName}
                </p>
                <p className="mt-1 font-dm-sans text-caption uppercase tracking-[0.14em] text-text-muted">
                  {itemToCancel.size} / {itemToCancel.color}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 font-dm-sans text-body-sm text-text-secondary">
                  <span>Available to cancel</span>
                  <span>{itemToCancel.cancellableQuantity ?? itemToCancel.quantity}</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-dm-sans text-label uppercase tracking-[0.16em] text-text-secondary">
                    Quantity
                  </Label>
                  <Select
                    onValueChange={setCancellationQuantity}
                    value={cancellationQuantity}
                  >
                    <SelectTrigger className="h-12 w-full border-border-warm bg-ivory font-dm-sans text-body-sm">
                      <SelectValue placeholder="Quantity" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: itemToCancel.cancellableQuantity ?? itemToCancel.quantity },
                        (_, index) => String(index + 1),
                      ).map((quantity) => (
                        <SelectItem key={quantity} value={quantity}>
                          {quantity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-dm-sans text-label uppercase tracking-[0.16em] text-text-secondary">
                    Reason
                  </Label>
                  <Select
                    onValueChange={(value): void =>
                      setCancellationReason(value as OrderCancellationReason)
                    }
                    value={cancellationReason}
                  >
                    <SelectTrigger className="h-12 w-full border-border-warm bg-ivory font-dm-sans text-body-sm">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {cancellationReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-dm-sans text-label uppercase tracking-[0.16em] text-text-secondary">
                  Note
                </Label>
                <textarea
                  className="min-h-24 w-full rounded-lg border border-border-warm bg-ivory px-4 py-3 font-dm-sans text-body-sm text-obsidian outline-none placeholder:text-text-muted focus:border-gold"
                  onChange={(event): void => setCancellationNote(event.target.value)}
                  placeholder="Optional detail for the Wahi team"
                  value={cancellationNote}
                />
              </div>

              <div className="rounded-lg border border-gold/30 bg-ivory p-4">
                <div className="flex items-center justify-between gap-3 font-dm-sans text-body-sm">
                  <span className="text-text-secondary">Cancellation amount</span>
                  <PriceDisplay
                    currency={itemToCancel.currency}
                    price={
                      itemToCancel.price *
                      (Number.parseInt(cancellationQuantity, 10) || 0)
                    }
                    size="sm"
                  />
                </div>
              </div>

              {cancellationError ? (
                <p className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 font-dm-sans text-body-sm text-error">
                  {cancellationError}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  className="h-11 rounded-full border border-bark/20 bg-transparent px-5 font-dm-sans text-body-sm font-medium text-obsidian hover:border-gold hover:bg-ivory"
                  disabled={isCancelling}
                  onClick={closeCancellationDialog}
                  type="button"
                  variant="ghost"
                >
                  Keep item
                </Button>
                <Button
                  className="h-11 rounded-full bg-gold px-5 font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
                  disabled={isCancelling}
                  onClick={(): void => {
                    void handleCancelItem();
                  }}
                  type="button"
                >
                  {isCancelling ? "Submitting..." : "Submit cancellation"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      <Footer />
    </>
  );
}
