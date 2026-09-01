"use server";

import type { Provider } from "@supabase/supabase-js";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { emailCredentialsSchema } from "@/domain/auth";
import { safeRelativePath } from "@/lib/http/safe-path";
import { createClient } from "@/lib/supabase/server";

function loginDestination(
  error: string,
  next: string,
  mode: "signin" | "signup",
) {
  return `/login?error=${encodeURIComponent(error)}&mode=${mode}&next=${encodeURIComponent(next)}`;
}

export async function signInWithEmail(formData: FormData) {
  const next = safeRelativePath(formData.get("next"));
  const parsed = emailCredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  let destination = loginDestination("invalid_credentials", next, "signin");

  if (parsed.success) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (!error) destination = next;
    } catch {
      destination = loginDestination("configuration", next, "signin");
    }
  }

  redirect(destination as Route);
}

export async function signUpWithEmail(formData: FormData) {
  const next = safeRelativePath(formData.get("next"));
  const parsed = emailCredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  let destination = loginDestination("invalid_credentials", next, "signup");

  if (parsed.success) {
    try {
      const supabase = await createClient();
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const callback = new URL("/auth/callback", siteUrl);
      callback.searchParams.set("next", next);
      const { data, error } = await supabase.auth.signUp({
        ...parsed.data,
        options: { emailRedirectTo: callback.toString() },
      });

      if (!error && data.session) {
        destination = `/onboarding?next=${encodeURIComponent(next)}`;
      } else if (!error) {
        destination = `/login?notice=check_email&mode=signin&next=${encodeURIComponent(next)}`;
      }
    } catch {
      destination = loginDestination("configuration", next, "signup");
    }
  }

  redirect(destination as Route);
}

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
