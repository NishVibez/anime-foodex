import { NextResponse } from "next/server";

import { safeRelativePath } from "@/lib/http/safe-path";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeRelativePath(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=callback", url.origin));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;

    const { data: contextData, error: contextError } = await supabase.rpc(
      "get_my_account_context",
    );
    const context = contextData?.[0];
    if (!contextError && context?.account_state === "active") {
      const welcome = new URL("/welcome", url.origin);
      welcome.searchParams.set("next", next);
      return NextResponse.redirect(welcome);
    }
    if (!contextError && context?.account_state === "restricted") {
      return NextResponse.redirect(
        new URL("/onboarding/ineligible", url.origin),
      );
    }

    const onboarding = new URL("/onboarding", url.origin);
    onboarding.searchParams.set("next", next);
    return NextResponse.redirect(onboarding);
  } catch {
    return NextResponse.redirect(new URL("/login?error=callback", url.origin));
  }
}
