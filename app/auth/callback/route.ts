import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const DEFAULT_AUTH_REDIRECT_PATH = "/account";
const LOGIN_PATH = "/auth/login";
const PASSWORD_RECOVERY_PATH = "/auth/update-password";

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

  return response;
}
