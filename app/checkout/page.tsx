"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import DeliveryForm from "@/components/checkout/DeliveryForm";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import Footer from "@/components/layout/Footer";
import {
  createCheckoutOrder,
  createSasaPayCheckoutSession,
  fetchCheckoutQuote,
  fetchPickupInfo,
  syncSasaPayStatus,
} from "@/lib/api/checkout";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import type {
  Address,
  CheckoutPaymentSelection,
  CheckoutQuote,
  DeliveryDetails,
  Order,
  PickupInfo,
} from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

type CheckoutStep = 1 | 2 | 3 | 4;

interface StepDefinition {
  id: CheckoutStep;
  label: string;
}

const steps: StepDefinition[] = [
  { id: 1, label: "Delivery" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Review" },
  { id: 4, label: "Confirmed" },
];

const PENDING_ORDER_STORAGE_KEY = "wahi-pending-order";

function buildDeliveryDefaults(
  isAuthenticated: boolean,
  userAddress: Address | null,
  userEmail?: string,
): Partial<DeliveryDetails> {
  if (!isAuthenticated || !userAddress) {
    return {};
  }

  return {
    fullName: userAddress.fullName,
    email: userEmail ?? "",
    phone: userAddress.phone,
    county: userAddress.county,
    town: userAddress.town,
    streetAddress: userAddress.streetAddress,
    additionalInfo: userAddress.additionalInfo,
    deliveryMethod: "delivery",
  };
}

function StepIndicator({
  currentStep,
}: {
  currentStep: CheckoutStep;
}): ReactElement {
  return (
    <div className="rounded-[28px] border border-border-warm bg-cream p-5 shadow-card">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div className="flex flex-1 items-center gap-2 sm:gap-4" key={step.id}>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border font-dm-sans text-body-sm font-medium transition-colors",
                    isCompleted
                      ? "border-gold bg-gold text-obsidian"
                      : isActive
                        ? "border-gold bg-gold text-obsidian ring-4 ring-gold/20"
                        : "border-border-warm bg-ivory text-text-muted",
                  )}
                >
                  {step.id}
                </div>
                <span
                  className={cn(
                    "hidden font-dm-sans text-body-sm sm:inline",
                    isCompleted || isActive ? "text-obsidian" : "text-text-muted",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    "h-px flex-1",
                    currentStep > step.id ? "bg-gold" : "bg-border-warm",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CheckoutPage(): ReactElement | null {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const totalItems = useCartStore((state) => state.totalItems);
  const clearCart = useCartStore((state) => state.clearCart);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [checkoutQuote, setCheckoutQuote] = useState<CheckoutQuote | null>(null);
  const [selectedPayment, setSelectedPayment] =
    useState<CheckoutPaymentSelection | null>(null);
  const [pickupInfo, setPickupInfo] = useState<PickupInfo | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [placeOrderError, setPlaceOrderError] = useState<string | null>(null);
  const [paymentActionError, setPaymentActionError] = useState<string | null>(null);
  const [isResolvingDelivery, setIsResolvingDelivery] = useState<boolean>(false);
  const [isResolvingPayment, setIsResolvingPayment] = useState<boolean>(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState<boolean>(false);

  const returnedOrderNumber = searchParams.get("order");
  const paymentReturnState = searchParams.get("payment");
  const isPaymentReturn = Boolean(returnedOrderNumber && paymentReturnState);

  useEffect((): void => {
    if (items.length === 0 && currentStep !== 4 && !isPaymentReturn) {
      router.replace("/cart");
    }
  }, [currentStep, isPaymentReturn, items.length, router]);

  useEffect((): void => {
    void (async (): Promise<void> => {
      const nextPickupInfo = await fetchPickupInfo();
      setPickupInfo(nextPickupInfo);
    })();
  }, []);

  const userAddress = user?.addresses[0] ?? null;
  const deliveryDefaults = useMemo(() => {
    if (deliveryDetails) {
      return deliveryDetails;
    }

    return buildDeliveryDefaults(isAuthenticated, userAddress, user?.email);
  }, [deliveryDetails, isAuthenticated, user?.email, userAddress]);

  const displayedDeliveryFee = checkoutQuote?.deliveryFee ?? 0;
  const displayedTotal = checkoutQuote?.total ?? subtotal;
  const showParcelDeliveryConfirmation = checkoutQuote?.deliveryMode === "parcel";

  useEffect((): void => {
    if (items.length > 0) {
      return;
    }

    const storedOrder = window.sessionStorage.getItem(PENDING_ORDER_STORAGE_KEY);
    if (!storedOrder) {
      return;
    }

    try {
      const parsedOrder = JSON.parse(storedOrder) as Order;
      if (!confirmedOrder && currentStep !== 4) {
        setConfirmedOrder(parsedOrder);
        setCurrentStep(4);
      }
    } catch {
      window.sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
    }
  }, [confirmedOrder, currentStep, items.length]);

  useEffect((): void => {
    if (!isPaymentReturn || !returnedOrderNumber) {
      return;
    }

    const storedOrder = window.sessionStorage.getItem(PENDING_ORDER_STORAGE_KEY);
    if (storedOrder) {
      try {
        const parsedOrder = JSON.parse(storedOrder) as Order;
        if (parsedOrder.orderNumber === returnedOrderNumber) {
          setConfirmedOrder(parsedOrder);
          setCurrentStep(4);
        }
      } catch {
        window.sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
      }
    }

    setPaymentActionError(null);

    void (async (): Promise<void> => {
      try {
        const paymentState = await syncSasaPayStatus({ orderNumber: returnedOrderNumber });
        setConfirmedOrder(paymentState.order);
        window.sessionStorage.setItem(
          PENDING_ORDER_STORAGE_KEY,
          JSON.stringify(paymentState.order),
        );
      } catch (error) {
        setPaymentActionError(
          error instanceof Error
            ? error.message
            : "We could not refresh your payment status yet.",
        );
      } finally {
        setCurrentStep(4);
      }
    })();
  }, [isPaymentReturn, returnedOrderNumber]);

  function buildPaymentReturnUrl(orderNumber: string, paymentState: string): string {
    if (typeof window === "undefined") {
      return "";
    }

    const baseUrl = window.location.origin;
    return `${baseUrl}/checkout?order=${encodeURIComponent(orderNumber)}&payment=${paymentState}`;
  }

  function isOrderEligibleForSasaPay(order: Order): boolean {
    return (
      order.paymentTiming === "prepay" &&
      order.paymentMethod === "mpesa" &&
      !order.manualDeliveryFeeConfirmationRequired &&
      order.orderStatus === "awaiting_payment"
    );
  }

  async function beginSasaPayCheckout(order: Order): Promise<void> {
    setIsRetryingPayment(true);
    setPaymentActionError(null);

    try {
      const paymentSession = await createSasaPayCheckoutSession({
        orderNumber: order.orderNumber,
        redirectUrl: buildPaymentReturnUrl(order.orderNumber, "return"),
        successUrl: buildPaymentReturnUrl(order.orderNumber, "success"),
        failureUrl: buildPaymentReturnUrl(order.orderNumber, "failed"),
      });

      setConfirmedOrder(paymentSession.order);
      window.sessionStorage.setItem(
        PENDING_ORDER_STORAGE_KEY,
        JSON.stringify(paymentSession.order),
      );
      window.location.assign(paymentSession.transaction.checkoutUrl);
    } catch (error) {
      setPaymentActionError(
        error instanceof Error
          ? error.message
          : "We could not open the payment page right now.",
      );
      setConfirmedOrder(order);
      setCurrentStep(4);
    } finally {
      setIsRetryingPayment(false);
    }
  }

  async function handleDeliverySubmit(data: DeliveryDetails): Promise<void> {
    setIsResolvingDelivery(true);
    setDeliveryError(null);

    try {
      const nextQuote = await fetchCheckoutQuote({
        cartItems: items,
        deliveryDetails: data,
      });

      setDeliveryDetails(data);
      setCheckoutQuote(nextQuote);
      setPlaceOrderError(null);
      setSelectedPayment(nextQuote.paymentSelection ?? nextQuote.availablePaymentOptions[0] ?? null);
      setCurrentStep(2);
    } catch (error) {
      setDeliveryError(
        error instanceof Error
          ? error.message
          : "We could not validate your delivery details.",
      );
    } finally {
      setIsResolvingDelivery(false);
    }
  }

  async function handlePaymentSubmit(
    selection: CheckoutPaymentSelection,
  ): Promise<void> {
    if (!deliveryDetails) {
      setCurrentStep(1);
      return;
    }

    setIsResolvingPayment(true);
    setPaymentError(null);

    try {
      const nextQuote = await fetchCheckoutQuote({
        cartItems: items,
        deliveryDetails,
        paymentSelection: selection,
      });

      setSelectedPayment(selection);
      setCheckoutQuote(nextQuote);
      setPlaceOrderError(null);
      setCurrentStep(3);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "We could not validate that payment option.",
      );
    } finally {
      setIsResolvingPayment(false);
    }
  }

  async function handlePlaceOrder(): Promise<void> {
    if (!deliveryDetails || !checkoutQuote || !selectedPayment) {
      setCurrentStep(1);
      return;
    }

    setIsPlacingOrder(true);
    setPlaceOrderError(null);
    setPaymentActionError(null);

    try {
      const order = await createCheckoutOrder({
        cartItems: items,
        deliveryDetails,
        paymentSelection: selectedPayment,
      });

      setConfirmedOrder(order);
      setCurrentStep(4);
      window.sessionStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(order));
      clearCart();

      if (isOrderEligibleForSasaPay(order)) {
        await beginSasaPayCheckout(order);
      }
    } catch (error) {
      setPlaceOrderError(
        error instanceof Error
          ? error.message
          : "We could not place your order right now.",
      );
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (items.length === 0 && currentStep !== 4) {
    return null;
  }

  return (
    <>
      <section className="bg-ivory px-6 py-10 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-container space-y-8">
          <div className="space-y-3">
            <nav className="flex items-center gap-2 font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
              <Link className="transition-colors hover:text-obsidian" href="/">
                Home
              </Link>
              <span>/</span>
              <Link className="transition-colors hover:text-obsidian" href="/cart">
                Cart
              </Link>
              <span>/</span>
              <span className="text-obsidian">Checkout</span>
            </nav>
            <h1 className="font-cormorant text-h1 text-obsidian lg:text-display-lg">
              Checkout
            </h1>
            <p className="max-w-2xl font-dm-sans text-body text-text-secondary">
              A few clear steps, now guided by live delivery rules.
            </p>
          </div>

          <StepIndicator currentStep={currentStep} />

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.55fr)_320px]">
            <div className="space-y-6">
              {currentStep === 1 ? (
                <DeliveryForm
                  defaultValues={deliveryDefaults}
                  isGuest={!isAuthenticated}
                  isSubmitting={isResolvingDelivery}
                  onSubmit={(data): void => {
                    void handleDeliverySubmit(data);
                  }}
                  pickupInfo={pickupInfo}
                  submitError={deliveryError}
                />
              ) : null}

              {currentStep === 2 && checkoutQuote ? (
                <PaymentMethod
                  availableOptions={checkoutQuote.availablePaymentOptions}
                  defaultSelection={selectedPayment}
                  isSubmitting={isResolvingPayment}
                  onSubmit={(selection): void => {
                    void handlePaymentSubmit(selection);
                  }}
                  quote={checkoutQuote}
                  submitError={paymentError}
                />
              ) : null}

              {currentStep === 3 && deliveryDetails && checkoutQuote && selectedPayment ? (
                <OrderSummary
                  deliveryDetails={deliveryDetails}
                  onEditDelivery={(): void => setCurrentStep(1)}
                  onEditPayment={(): void => setCurrentStep(2)}
                  onPlaceOrder={(): void => {
                    void handlePlaceOrder();
                  }}
                  placeOrderError={placeOrderError}
                  paymentSelection={selectedPayment}
                  quote={checkoutQuote}
                  isSubmitting={isPlacingOrder}
                />
              ) : null}

              {currentStep === 4 && confirmedOrder ? (
                <OrderConfirmation
                  isRetryingPayment={isRetryingPayment}
                  onRetryPayment={
                    isOrderEligibleForSasaPay(confirmedOrder)
                      ? (): void => {
                          void beginSasaPayCheckout(confirmedOrder);
                        }
                      : undefined
                  }
                  order={confirmedOrder}
                  paymentActionError={paymentActionError}
                />
              ) : null}
            </div>

            {currentStep < 4 ? (
              <aside className="rounded-[28px] border border-border-warm bg-cream p-6 shadow-card lg:sticky lg:top-24">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
                      Your Order
                    </p>
                    <h2 className="font-cormorant text-h3 text-obsidian">
                      {totalItems} {totalItems === 1 ? "item" : "items"} selected
                    </h2>
                    <p className="font-dm-sans text-body-sm text-text-secondary">
                      Delivery is confirmed after we validate your location.
                    </p>
                  </div>

                  <div className="space-y-3 font-dm-sans text-body-sm text-text-secondary">
                    <div className="flex items-center justify-between gap-4">
                      <span>Subtotal</span>
                      <span className="text-obsidian">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Delivery</span>
                      <span className="text-obsidian">
                        {checkoutQuote
                          ? checkoutQuote.manualDeliveryFeeConfirmationRequired ||
                            showParcelDeliveryConfirmation
                            ? "To Be Confirmed"
                            : displayedDeliveryFee === 0
                              ? "Free"
                              : formatPrice(displayedDeliveryFee)
                          : "Calculated next"}
                      </span>
                    </div>
                    <div className="h-px w-full bg-border-warm" />
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium text-obsidian">Total</span>
                      <span className="font-semibold text-obsidian">
                        {checkoutQuote?.manualDeliveryFeeConfirmationRequired ||
                          showParcelDeliveryConfirmation
                          ? `${formatPrice(subtotal)} + delivery to be confirmed`
                          : formatPrice(displayedTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
