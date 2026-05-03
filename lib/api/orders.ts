import type { Order, OrderCancellationInput } from "@/lib/types";
import { getApiBaseUrl } from "@/lib/api/baseUrl";
import { createClient } from "@/lib/supabase/client";

async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export async function fetchAccountOrders(): Promise<Order[]> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return [];
  }

  const response = await fetch(`${getApiBaseUrl()}/api/v1/account/orders`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load your recent orders.");
  }

  return (await response.json()) as Order[];
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null && "detail" in payload) {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string") {
      return detail;
    }
  }

  if (typeof payload === "object" && payload !== null && "items" in payload) {
    const items = (payload as { items?: unknown }).items;
    if (typeof items === "string") {
      return items;
    }
  }

  return fallback;
}

export async function cancelOrderItems({
  orderNumber,
  items,
  reason,
  note,
}: OrderCancellationInput): Promise<Order> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Please sign in to cancel items from this order.");
  }

  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/account/orders/${encodeURIComponent(orderNumber)}/cancellations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items, reason, note }),
    },
  );
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "We could not cancel this item right now."));
  }

  return payload as Order;
}
