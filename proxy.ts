import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only signed-in areas need the server-side session refresh. Running it on
  // public shop pages cost a function run and a Supabase call on every request.
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/account/:path*",
    "/auth/:path*",
    "/checkout/:path*",
    "/wishlist/:path*",
  ],
};
