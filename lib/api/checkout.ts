import type {
  CartItem,
  CheckoutPaymentSelection,
  CheckoutQuote,
  DeliveryDetails,
  Order,
  PaymentSessionResponse,
  PickupInfo,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_API_BASE_URL = "http://localhost:8000";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

async function buildHeaders(): Promise<HeadersInit> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return {
      "Content-Type": "application/json",
    };
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

function normalizeCheckoutError(status: number, detail?: string): Error {
  if (detail?.trim()) {
    return new Error(detail);
  }

  if (status >= 500) {
    return new Error("We could not reach checkout right now. Please try again.");
  }

  return new Error("We could not validate this checkout selection.");
}

export async function fetchPickupInfo(): Promise<PickupInfo | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/checkout/pickup-info`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to load pickup details.");
    }

    return (await response.json()) as PickupInfo;
  } catch {
    return null;
  }
}

export async function fetchCheckoutQuote({
  cartItems,
  deliveryDetails,
  paymentSelection,
}: {
  cartItems: CartItem[];
  deliveryDetails: DeliveryDetails;
  paymentSelection?: CheckoutPaymentSelection;
}): Promise<CheckoutQuote> {
  const headers = await buildHeaders();
  const response = await fetch(`${getApiBaseUrl()}/api/v1/checkout/quote`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      cart: cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      deliveryDetails,
      paymentSelection,
    }),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | { detail?: string }
      | null;

    throw normalizeCheckoutError(response.status, errorPayload?.detail);
  }

  return (await response.json()) as CheckoutQuote;
}

export async function createCheckoutOrder({
  cartItems,
  deliveryDetails,
  paymentSelection,
}: {
  cartItems: CartItem[];
  deliveryDetails: DeliveryDetails;
  paymentSelection: CheckoutPaymentSelection;
}): Promise<Order> {
  const headers = await buildHeaders();
  const response = await fetch(`${getApiBaseUrl()}/api/v1/checkout/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      cart: cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      deliveryDetails,
      paymentSelection,
    }),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | { detail?: string }
      | null;

    throw normalizeCheckoutError(response.status, errorPayload?.detail);
  }

  return (await response.json()) as Order;
}

export async function createSasaPayCheckoutSession({
  orderNumber,
  redirectUrl,
  successUrl,
  failureUrl,
}: {
  orderNumber: string;
  redirectUrl: string;
  successUrl: string;
  failureUrl: string;
}): Promise<PaymentSessionResponse> {
  const headers = await buildHeaders();
  const response = await fetch(`${getApiBaseUrl()}/api/v1/payments/sasapay/checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      orderNumber,
      redirectUrl,
      successUrl,
      failureUrl,
    }),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | { detail?: string }
      | null;

    throw normalizeCheckoutError(response.status, errorPayload?.detail);
  }

  return (await response.json()) as PaymentSessionResponse;
}

export async function syncSasaPayStatus({
  orderNumber,
}: {
  orderNumber: string;
}): Promise<PaymentSessionResponse> {
  const headers = await buildHeaders();
  const response = await fetch(`${getApiBaseUrl()}/api/v1/payments/sasapay/status-sync`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      orderNumber,
    }),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | { detail?: string }
      | null;

    throw normalizeCheckoutError(response.status, errorPayload?.detail);
  }

  return (await response.json()) as PaymentSessionResponse;
}
