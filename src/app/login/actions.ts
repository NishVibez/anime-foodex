"use server";

import type { Provider } from "@supabase/supabase-js";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { safeRelativePath } from "@/lib/http/safe-path";
import { createClient } from "@/lib/supabase/server";

export async function signInWithOAuth(formData: FormData) {
  const rawProvider = formData.get("provider");
  const provider: Provider = rawProvider === "discord" ? "discord" : "google";
  const next = safeRelativePath(formData.get("next"));

  let destination = `/login?error=oauth&next=${encodeURIComponent(next)}`;
  try {
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
        scopes:
          provider === "discord" ? "identify email" : "openid email profile",
      },
    });
    if (!error && data.url) {
      const target = new URL(data.url);
      const expected = new URL(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://invalid.supabase.co",
      );
      if (target.origin === expected.origin) destination = target.toString();
    }
  } catch {
    destination = `/login?error=configuration&next=${encodeURIComponent(next)}`;
  }

  redirect(destination as Route);
}
