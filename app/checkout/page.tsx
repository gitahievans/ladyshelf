"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import DeliveryForm from "@/components/checkout/DeliveryForm";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import type {
  Address,
  DeliveryDetails,
  Order,
  PaymentMethod as PaymentMethodType,
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

const DELIVERY_THRESHOLD = 5000;
const DELIVERY_FEE = 300;

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
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const totalItems = useCartStore((state) => state.totalItems);
  const clearCart = useCartStore((state) => state.clearCart);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("mpesa");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect((): void => {
    if (items.length === 0 && currentStep !== 4) {
      router.replace("/cart");
    }
  }, [currentStep, items.length, router]);

  const userAddress = user?.addresses[0] ?? null;
  const deliveryDefaults = useMemo(() => {
    if (deliveryDetails) {
      return deliveryDetails;
    }

    return buildDeliveryDefaults(isAuthenticated, userAddress, user?.email);
  }, [deliveryDetails, isAuthenticated, user?.email, userAddress]);
  const deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  function handleDeliverySubmit(data: DeliveryDetails): void {
    setDeliveryDetails(data);
    setCurrentStep(2);
  }

  function handlePaymentSubmit(method: PaymentMethodType): void {
    setPaymentMethod(method);
    setCurrentStep(3);
  }

  function handlePlaceOrder(): void {
    if (!deliveryDetails) {
      setCurrentStep(1);
      return;
    }

    const mockOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber: `WF-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
      userId: user?.id,
      guestEmail: !user ? deliveryDetails.email : undefined,
      items,
      deliveryDetails,
      subtotal,
      deliveryFee,
      discount: 0,
      total,
      currency: "KES",
      paymentMethod,
      paymentStatus: "paid",
      orderStatus: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConfirmedOrder(mockOrder);
    setCurrentStep(4);
    clearCart();
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
              A few clear steps, then it is on its way.
            </p>
          </div>

          <StepIndicator currentStep={currentStep} />

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.55fr)_320px]">
            <div className="space-y-6">
              {currentStep === 1 ? (
                <DeliveryForm
                  defaultValues={deliveryDefaults}
                  isGuest={!isAuthenticated}
                  onSubmit={handleDeliverySubmit}
                />
              ) : null}

              {currentStep === 2 ? (
                <PaymentMethod
                  defaultMethod={paymentMethod}
                  onSubmit={handlePaymentSubmit}
                />
              ) : null}

              {currentStep === 3 && deliveryDetails ? (
                <OrderSummary
                  deliveryDetails={deliveryDetails}
                  deliveryFee={deliveryFee}
                  items={items}
                  onEditDelivery={(): void => setCurrentStep(1)}
                  onEditPayment={(): void => setCurrentStep(2)}
                  onPlaceOrder={handlePlaceOrder}
                  paymentMethod={paymentMethod}
                  subtotal={subtotal}
                  total={total}
                />
              ) : null}

              {currentStep === 4 && confirmedOrder ? (
                <OrderConfirmation order={confirmedOrder} />
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
                      Free delivery begins at KES 5,000.
                    </p>
                  </div>

                  <div className="space-y-3 font-dm-sans text-body-sm text-text-secondary">
                    <div className="flex items-center justify-between gap-4">
                      <span>Subtotal</span>
                      <span className="text-obsidian">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Delivery</span>
                      <span className={deliveryFee === 0 ? "text-success" : "text-obsidian"}>
                        {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                      </span>
                    </div>
                    <div className="h-px w-full bg-border-warm" />
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium text-obsidian">Total</span>
                      <span className="font-semibold text-obsidian">
                        {formatPrice(total)}
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
