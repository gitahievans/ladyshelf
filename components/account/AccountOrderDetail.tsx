"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";

import Footer from "@/components/layout/Footer";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { Button } from "@/components/ui/button";
import { createSasaPayCheckoutSession, syncSasaPayStatus } from "@/lib/api/checkout";
import { fetchAccountOrders } from "@/lib/api/orders";
import { formatDate } from "@/lib/utils/format";
import { isOrderEligibleForSasaPayRetry } from "@/lib/utils/orderPayments";
import type { Order } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

interface AccountOrderDetailProps {
  orderNumber: string;
}

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

  function handleReorder(): void {
    if (!order) {
      return;
    }

    clearCart();
    order.items.forEach((item) => addItem({ ...item, id: crypto.randomUUID() }));
    router.push("/cart");
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
                  {order.items.map((item) => (
                    <div
                      className="flex items-start justify-between gap-4 rounded-2xl border border-border-warm bg-ivory p-4"
                      key={item.id}
                    >
                      <div className="space-y-2">
                        <p className="font-dm-sans text-body-sm font-medium text-obsidian">
                          {item.productName}
                        </p>
                        <p className="font-dm-sans text-caption uppercase tracking-[0.14em] text-text-muted">
                          {item.size} / {item.color}
                        </p>
                        <p className="font-dm-sans text-body-sm text-text-secondary">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <PriceDisplay
                        currency={item.currency}
                        price={item.price * item.quantity}
                        size="sm"
                      />
                    </div>
                  ))}
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
                    onClick={handleReorder}
                    type="button"
                    variant="ghost"
                  >
                    Order Again
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
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
