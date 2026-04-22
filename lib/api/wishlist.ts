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

async function getAuthHeaders(): Promise<HeadersInit> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("You need to sign in to access your wishlist.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function fetchWishlistProductIds(): Promise<string[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/wishlist/`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load your wishlist.");
  }

  const data = (await response.json()) as { productIds: string[] };
  return data.productIds;
}

export async function addWishlistItem(productId: string): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/wishlist/`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ productId }),
  });

  if (!response.ok) {
    throw new Error("Unable to save that piece to your wishlist.");
  }
}

export async function removeWishlistItem(productId: string): Promise<void> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/wishlist/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    },
  );

  if (!response.ok && response.status !== 204) {
    throw new Error("Unable to remove that piece from your wishlist.");
  }
}

export async function clearWishlistItems(): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/wishlist/`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  if (!response.ok && response.status !== 204) {
    throw new Error("Unable to clear your wishlist.");
  }
}
