import type { User } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_API_BASE_URL = "http://localhost:8000";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
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
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return null;
  }

  return fetchCurrentUser(session.access_token);
}
