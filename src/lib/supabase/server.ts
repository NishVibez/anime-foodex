import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

import { readPublicEnvironment } from "./env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = readPublicEnvironment();

  return createServerClient<Database>(url, publishableKey, {
    db: { schema: "api" },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write cookies. The root proxy refreshes
          // sessions and writes the same cookie set to the response.
        }
      },
    },
  });
}

export async function getVerifiedClaims() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) return null;
  return data.claims;
}
