import type { Address, AddressInput } from "@/lib/types";
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
    throw new Error("Please sign in to manage your saved addresses.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

async function parseAddressError(response: Response): Promise<Error> {
  const errorPayload = (await response.json().catch(() => null)) as
    | { detail?: string }
    | null;

  return new Error(
    errorPayload?.detail?.trim() || "We couldn't save your address right now.",
  );
}

export async function createAccountAddress(input: AddressInput): Promise<Address> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/account/addresses`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseAddressError(response);
  }

  return (await response.json()) as Address;
}

export async function updateAccountAddress(
  id: string,
  input: AddressInput,
): Promise<Address> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/account/addresses/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw await parseAddressError(response);
  }

  return (await response.json()) as Address;
}

export async function deleteAccountAddress(id: string): Promise<void> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/account/addresses/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    },
  );

  if (!response.ok && response.status !== 204) {
    throw new Error("We couldn't remove that address right now.");
  }
}
