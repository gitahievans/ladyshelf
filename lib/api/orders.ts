import type { Order } from "@/lib/types";
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
