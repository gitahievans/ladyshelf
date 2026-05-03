"use client";

import type { ReactElement } from "react";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import DeliveryForm from "@/components/checkout/DeliveryForm";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import Footer from "@/components/layout/Footer";
import { createAccountAddress } from "@/lib/api/addresses";
import { fetchCatalogProducts } from "@/lib/api/catalog";
import {
  createCheckoutOrder,
  createSasaPayCheckoutSession,
  fetchCheckoutQuote,
  fetchPickupInfo,
  syncSasaPayStatus,
} from "@/lib/api/checkout";
import { cn } from "@/lib/utils/cn";
import {
  buildCartStockAdjustmentMessage,
  reconcileCartItemsWithProducts,
} from "@/lib/utils/cartStock";
import { formatPrice } from "@/lib/utils/format";
import { isOrderEligibleForSasaPayRetry } from "@/lib/utils/orderPayments";
import type {
  Address,
  AddressInput,
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
const SASAPAY_OVERLAY_TIMEOUT_MS = 8000;

function buildSavedAddressInput(details: DeliveryDetails): AddressInput {
  return {
    label: "home",
    fullName: details.fullName,
    phone: details.phone,
    county: details.county,
    town: details.town,
    streetAddress: details.streetAddress,
    additionalInfo: details.additionalInfo,
    isDefault: false,
  };
}

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
  onStepClick,
  isStepAvailable,
}: {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
  isStepAvailable?: (step: CheckoutStep) => boolean;
}): ReactElement {
  return (
    <div className="rounded-[28px] border border-border-warm bg-cream p-5 shadow-card">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isAvailable = isStepAvailable ? isStepAvailable(step.id) : true;
          const isClickable = Boolean(onStepClick) && isAvailable;

          return (
            <div className="flex flex-1 items-center gap-2 sm:gap-4" key={step.id}>
              <div className="flex items-center gap-3">
                <button
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border font-dm-sans text-body-sm font-medium transition-colors",
                    isClickable ? "cursor-pointer" : "cursor-default",
                    isCompleted
                      ? "border-gold bg-gold text-obsidian"
                      : isActive
                        ? "border-gold bg-gold text-obsidian ring-4 ring-gold/20"
                        : "border-border-warm bg-ivory text-text-muted",
                    isClickable ? "hover:border-gold hover:text-obsidian" : "",
                  )}
                  disabled={!isClickable}
                  onClick={(): void => onStepClick?.(step.id)}
                  type="button"
                >
                  {step.id}
                </button>
                <button
                  className={cn(
                    "hidden font-dm-sans text-body-sm transition-colors sm:inline",
                    isClickable ? "cursor-pointer hover:text-obsidian" : "cursor-default",
                    isCompleted || isActive ? "text-obsidian" : "text-text-muted",
                  )}
                  disabled={!isClickable}
                  onClick={(): void => onStepClick?.(step.id)}
                  type="button"
                >
                  {step.label}
                </button>
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

function CheckoutPageContent(): ReactElement | null {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const totalItems = useCartStore((state) => state.totalItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const replaceItems = useCartStore((state) => state.replaceItems);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [deliveryPreviewDetails, setDeliveryPreviewDetails] =
    useState<DeliveryDetails | null>(null);
  const [checkoutQuote, setCheckoutQuote] = useState<CheckoutQuote | null>(null);
  const [selectedPayment, setSelectedPayment] =
    useState<CheckoutPaymentSelection | null>(null);
  const [pickupInfo, setPickupInfo] = useState<PickupInfo | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [shouldSaveDeliveryAddress, setShouldSaveDeliveryAddress] = useState<boolean>(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [placeOrderError, setPlaceOrderError] = useState<string | null>(null);
  const [paymentActionError, setPaymentActionError] = useState<string | null>(null);
  const [isResolvingDelivery, setIsResolvingDelivery] = useState<boolean>(false);
  const [isResolvingPayment, setIsResolvingPayment] = useState<boolean>(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState<boolean>(false);
  const [isOpeningSasaPay, setIsOpeningSasaPay] = useState<boolean>(false);
  const [hasCheckedStoredOrder, setHasCheckedStoredOrder] = useState<boolean>(false);
  const [cartSyncNotice, setCartSyncNotice] = useState<string | null>(null);
  const [isCheckingCartStock, setIsCheckingCartStock] = useState<boolean>(false);

  const returnedOrderNumber = searchParams.get("order");
  const paymentReturnState = searchParams.get("payment");
  const isPaymentReturn = Boolean(returnedOrderNumber && paymentReturnState);

  function readStoredPendingOrder(): Order | null {
    if (typeof window === "undefined") {
      return null;
    }

    const storedOrder = window.sessionStorage.getItem(PENDING_ORDER_STORAGE_KEY);

    if (!storedOrder) {
      return null;
    }

    try {
      return JSON.parse(storedOrder) as Order;
    } catch {
      window.sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
      return null;
    }
  }

  function recoverPendingOrder(message?: string): void {
    const storedOrder = readStoredPendingOrder();

    setIsOpeningSasaPay(false);

    if (!storedOrder) {
      if (message) {
        setPaymentActionError(message);
      }
      return;
    }

    setConfirmedOrder(storedOrder);
    setCurrentStep(4);

    if (message) {
      setPaymentActionError(message);
    }
  }

  useEffect(() => {
    if (!hasCheckedStoredOrder) {
      return;
    }

    if (
      items.length === 0 &&
      currentStep !== 4 &&
      !isPaymentReturn &&
      !isOpeningSasaPay &&
      !confirmedOrder
    ) {
      router.replace("/cart");
    }
  }, [
    confirmedOrder,
    currentStep,
    hasCheckedStoredOrder,
    isOpeningSasaPay,
    isPaymentReturn,
    items.length,
    router,
  ]);

  useEffect(() => {
    void (async (): Promise<void> => {
      const nextPickupInfo = await fetchPickupInfo();
      setPickupInfo(nextPickupInfo);
    })();
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      setCartSyncNotice(null);
      setIsCheckingCartStock(false);
      return;
    }

    let isMounted = true;

    setIsCheckingCartStock(true);

    void (async (): Promise<void> => {
      try {
        const liveProducts = await fetchCatalogProducts();

        if (!isMounted) {
          return;
        }

        if (liveProducts.length === 0) {
          setCartSyncNotice(
            "We could not verify live stock right now. We will confirm it again before your order moves forward.",
          );
          return;
        }

        const reconciliation = reconcileCartItemsWithProducts(items, liveProducts);
        const hasChanges =
          reconciliation.adjustments.length > 0 ||
          reconciliation.items.length !== items.length;

        if (hasChanges) {
          replaceItems(reconciliation.items);
        }

        if (reconciliation.adjustments.length > 0) {
          setCartSyncNotice(
            reconciliation.adjustments
              .map((adjustment) => buildCartStockAdjustmentMessage(adjustment))
              .join(" "),
          );
          return;
        }

        setCartSyncNotice(null);
      } finally {
        if (isMounted) {
          setIsCheckingCartStock(false);
        }
      }
    })();

    return (): void => {
      isMounted = false;
    };
  }, [items, replaceItems]);

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

  function isStepAvailable(step: CheckoutStep): boolean {
    if (step === 1) {
      return true;
    }

    if (step === 2) {
      return checkoutQuote !== null;
    }

    if (step === 3) {
      return (
        deliveryDetails !== null &&
        checkoutQuote !== null &&
        selectedPayment !== null
      );
    }

    return confirmedOrder !== null;
  }

  function handleStepClick(step: CheckoutStep): void {
    if (!isStepAvailable(step)) {
      return;
    }

    setCurrentStep(step);
  }

  async function refreshCartAvailability(): Promise<{
    hasAdjustments: boolean;
  }> {
    const liveProducts = await fetchCatalogProducts();

    if (liveProducts.length === 0) {
      setCartSyncNotice(
        "We could not verify live stock right now. Please try again in a moment.",
      );
      return { hasAdjustments: false };
    }

    const reconciliation = reconcileCartItemsWithProducts(items, liveProducts);
    const hasAdjustments =
      reconciliation.adjustments.length > 0 ||
      reconciliation.items.length !== items.length;

    if (hasAdjustments) {
      replaceItems(reconciliation.items);
      setCartSyncNotice(
        reconciliation.adjustments.length > 0
          ? reconciliation.adjustments
              .map((adjustment) => buildCartStockAdjustmentMessage(adjustment))
              .join(" ")
          : "Your bag was updated to match current stock.",
      );
    } else {
      setCartSyncNotice(null);
    }

    return {
      hasAdjustments,
    };
  }

  useEffect(() => {
    if (currentStep !== 1 || !deliveryPreviewDetails || items.length === 0) {
      return;
    }

    const isPickup = deliveryPreviewDetails.deliveryMethod === "pickup";
    const hasEnoughDetails = isPickup
      ? Boolean(deliveryPreviewDetails.fullName && deliveryPreviewDetails.email && deliveryPreviewDetails.phone)
      : Boolean(
          deliveryPreviewDetails.fullName &&
            deliveryPreviewDetails.email &&
            deliveryPreviewDetails.phone &&
            deliveryPreviewDetails.streetAddress &&
            deliveryPreviewDetails.county &&
            deliveryPreviewDetails.town &&
            deliveryPreviewDetails.latitude != null &&
            deliveryPreviewDetails.longitude != null,
        );

    if (!hasEnoughDetails) {
      setCheckoutQuote(null);
      return;
    }

    const timeoutId = window.setTimeout((): void => {
      void (async (): Promise<void> => {
        try {
          const nextQuote = await fetchCheckoutQuote({
            cartItems: items,
            deliveryDetails: deliveryPreviewDetails,
          });
          setCheckoutQuote(nextQuote);
        } catch {
          setCheckoutQuote(null);
        }
      })();
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentStep, deliveryPreviewDetails, items]);

  useEffect((): void => {
    const storedOrder = readStoredPendingOrder();

    if (items.length === 0 && storedOrder && !confirmedOrder && currentStep !== 4) {
      setConfirmedOrder(storedOrder);
      setCurrentStep(4);
    }

    setHasCheckedStoredOrder(true);
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
        setIsOpeningSasaPay(false);
        setCurrentStep(4);
      }
    })();
  }, [isPaymentReturn, returnedOrderNumber]);

  useEffect((): (() => void) | void => {
    if (!isOpeningSasaPay) {
      return;
    }

    const timeoutId = window.setTimeout((): void => {
      recoverPendingOrder(
        "We could not confirm that SasaPay opened. Your order is saved and you can retry payment when ready.",
      );
    }, SASAPAY_OVERLAY_TIMEOUT_MS);

    return (): void => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpeningSasaPay]);

  function buildPaymentReturnUrl(orderNumber: string, paymentState: string): string {
    if (typeof window === "undefined") {
      return "";
    }

    const baseUrl = window.location.origin;
    return `${baseUrl}/checkout?order=${encodeURIComponent(orderNumber)}&payment=${paymentState}`;
  }

  async function beginSasaPayCheckout(order: Order): Promise<void> {
    setIsRetryingPayment(true);
    setIsOpeningSasaPay(true);
    setPaymentActionError(null);

    try {
      const paymentSession = await createSasaPayCheckoutSession({
        orderNumber: order.orderNumber,
        redirectUrl: buildPaymentReturnUrl(order.orderNumber, "return"),
        successUrl: buildPaymentReturnUrl(order.orderNumber, "success"),
        failureUrl: buildPaymentReturnUrl(order.orderNumber, "failed"),
      });

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
      setIsOpeningSasaPay(false);
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
      const { hasAdjustments } = await refreshCartAvailability();

      if (hasAdjustments) {
        setDeliveryError(
          "Your bag changed while we checked live stock. Please review it, then continue again.",
        );
        return;
      }

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
      const { hasAdjustments } = await refreshCartAvailability();

      if (hasAdjustments) {
        setPaymentError(
          "Your bag changed while we checked live stock. Please review your delivery details and continue again.",
        );
        setCurrentStep(1);
        return;
      }

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
      const { hasAdjustments } = await refreshCartAvailability();

      if (hasAdjustments) {
        setPlaceOrderError(
          "Your bag changed while we checked live stock. Please review your order again before placing it.",
        );
        setCurrentStep(1);
        return;
      }

      const order = await createCheckoutOrder({
        cartItems: items,
        deliveryDetails,
        paymentSelection: selectedPayment,
      });

      if (isAuthenticated && shouldSaveDeliveryAddress && deliveryDetails.deliveryMethod === "delivery") {
        try {
          await createAccountAddress(buildSavedAddressInput(deliveryDetails));
          await useAuthStore.getState().refreshUser();
        } catch {
          // Address saving is supportive, not checkout-blocking.
        }
      }

      if (isOrderEligibleForSasaPayRetry(order)) {
        window.sessionStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(order));
        setIsOpeningSasaPay(true);
        clearCart();
        await beginSasaPayCheckout(order);
        return;
      }

      setConfirmedOrder(order);
      setCurrentStep(4);
      window.sessionStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(order));
      clearCart();
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

  if (items.length === 0 && currentStep !== 4 && !isOpeningSasaPay) {
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
          </div>

          <StepIndicator
            currentStep={currentStep}
            isStepAvailable={isStepAvailable}
            onStepClick={handleStepClick}
          />

          {cartSyncNotice ? (
            <div className="rounded-2xl border border-gold/30 bg-cream p-4">
              <p className="font-dm-sans text-body-sm text-text-secondary">
                {cartSyncNotice}
              </p>
            </div>
          ) : null}

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.55fr)_320px]">
            <div className="space-y-6">
              {isCheckingCartStock ? (
                <div className="flex items-center gap-3 rounded-2xl border border-border-warm bg-cream p-4 font-dm-sans text-body-sm text-text-secondary shadow-card">
                  <Loader2 className="size-4 animate-spin text-gold" />
                  Checking live stock for your bag.
                </div>
              ) : null}

              {currentStep === 1 ? (
                <DeliveryForm
                  defaultValues={deliveryDefaults}
                  isGuest={!isAuthenticated}
                  isSubmitting={isResolvingDelivery}
                  onSaveAddressChange={setShouldSaveDeliveryAddress}
                  onChange={(data): void => {
                    setDeliveryPreviewDetails(data);
                  }}
                  onSubmit={(data): void => {
                    void handleDeliverySubmit(data);
                  }}
                  pickupInfo={pickupInfo}
                  saveAddressByDefault={shouldSaveDeliveryAddress}
                  submitError={deliveryError}
                />
              ) : null}

              {currentStep === 2 && checkoutQuote ? (
                <PaymentMethod
                  availableOptions={checkoutQuote.availablePaymentOptions}
                  defaultSelection={selectedPayment}
                  isSubmitting={isResolvingPayment}
                  onBack={(): void => setCurrentStep(1)}
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
                  onBack={(): void => setCurrentStep(2)}
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
                    isOrderEligibleForSasaPayRetry(confirmedOrder)
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
                          : "Fill delivery details"}
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

      {isOpeningSasaPay ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/80 px-6 text-center backdrop-blur-sm">
          <div className="max-w-sm rounded-[28px] border border-gold/30 bg-ivory p-8 shadow-card">
            <Loader2 className="mx-auto size-9 animate-spin text-gold" />
            <h2 className="mt-5 font-cormorant text-h3 text-obsidian">
              Opening SasaPay
            </h2>
            <p className="mt-3 font-dm-sans text-body-sm text-text-secondary">
              Please hold on while we prepare your secure payment page.
            </p>
          </div>
        </div>
      ) : null}

      <Footer />
    </>
  );
}

export default function CheckoutPage(): ReactElement {
  return (
    <Suspense fallback={null}>
      <CheckoutPageContent />
    </Suspense>
  );
}
