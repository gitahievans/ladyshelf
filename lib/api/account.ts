import type { UpdateCurrentUserPayload, User } from "@/lib/types";
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
    throw new Error("Please sign in to continue.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function fetchCurrentUser(accessToken: string): Promise<User> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/account/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load your account details.");
  }

  return (await response.json()) as User;
}

export async function fetchCurrentUserFromSession(): Promise<User | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  return fetchCurrentUser(accessToken);
}

export async function updateCurrentUser({
  firstName,
  lastName,
  phone,
}: UpdateCurrentUserPayload): Promise<User> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/account/me`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ firstName, lastName, phone }),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | { detail?: string }
      | null;

    throw new Error(
      errorPayload?.detail?.trim() || "We couldn't save your profile changes right now.",
    );
  }

  return (await response.json()) as User;
}
