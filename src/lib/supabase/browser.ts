"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

import { readPublicEnvironment } from "./env";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (browserClient) return browserClient;

  const { url, publishableKey } = readPublicEnvironment();
  browserClient = createBrowserClient<Database>(url, publishableKey, {
    db: { schema: "api" },
  });

  return browserClient;
}
