import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

import { readPublicEnvironment } from "./env";

export async function updateSession(
  request: NextRequest,
  requestHeaders = new Headers(request.headers),
) {
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const { url, publishableKey } = readPublicEnvironment();

  const supabase = createServerClient<Database>(url, publishableKey, {
    db: { schema: "api" },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getClaims validates the JWT signature; getSession must not be trusted for
  // authorization in server code.
  await supabase.auth.getClaims();
  return response;
}
