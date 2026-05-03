import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api/baseUrl";

const DEFAULT_AUTH_REDIRECT_PATH = "/account";
const COMPLETE_PROFILE_PATH = "/auth/complete-profile";
const LOGIN_PATH = "/auth/login";
const PASSWORD_RECOVERY_PATH = "/auth/update-password";

interface AccountProfileResponse {
  phone?: string | null;
}

function getSafeRedirectPath(nextPath: string | null): string {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT_PATH;
  }

  return nextPath;
}

function getRedirectPath(requestUrl: URL): string {
  const nextPath = requestUrl.searchParams.get("next");
  const type = requestUrl.searchParams.get("type");

  if (type === "recovery" || nextPath === PASSWORD_RECOVERY_PATH) {
    return PASSWORD_RECOVERY_PATH;
  }

  return getSafeRedirectPath(nextPath);
}

function getLoginRedirect(requestUrl: URL): NextResponse {
  const redirectUrl = new URL(LOGIN_PATH, requestUrl.origin);
  redirectUrl.searchParams.set(
    "message",
    "We couldn't complete your sign-in. Please try again.",
  );

  return NextResponse.redirect(redirectUrl);
}

async function fetchAccountProfile(accessToken: string): Promise<AccountProfileResponse | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/account/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AccountProfileResponse;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return getLoginRedirect(requestUrl);
  }

  const redirectUrl = new URL(getRedirectPath(requestUrl), requestUrl.origin);
  const response = NextResponse.redirect(redirectUrl);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return getLoginRedirect(requestUrl);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return response;
  }

  const profile = await fetchAccountProfile(session.access_token);

  if (!profile) {
    return response;
  }

  const phone = profile.phone?.trim();

  if (!phone) {
    const completeProfileUrl = new URL(COMPLETE_PROFILE_PATH, requestUrl.origin);
    completeProfileUrl.searchParams.set(
      "next",
      `${redirectUrl.pathname}${redirectUrl.search}`,
    );
    return NextResponse.redirect(completeProfileUrl, {
      headers: response.headers,
    });
  }

  return response;
}
