import "server-only";

import { redirect } from "next/navigation";

import type { AccessTier } from "@/domain/contracts";
import { createClient, getVerifiedClaims } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  accessTier: AccessTier;
  activeEntitlementId: string | null;
  activeEntitlementUntil: string | null;
  entitlementLifetime: boolean;
};

type AccountContext = {
  userId: string;
  accountState: string;
  entitlementId: string | null;
  entitlementEffectiveUntil: string | null;
  entitlementLifetime: boolean;
};

async function getAccountContext(): Promise<AccountContext | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return null;
  }

  try {
    const claims = await getVerifiedClaims();
    const userId = typeof claims?.sub === "string" ? claims.sub : null;
    if (!userId) return null;

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_my_account_context");
    const context = data?.[0];
    if (error || !context) return null;
    return {
      userId,
      accountState: context.account_state,
      entitlementId: context.entitlement_id,
      entitlementEffectiveUntil: context.entitlement_effective_until,
      entitlementLifetime: context.entitlement_lifetime ?? false,
    };
  } catch {
    return null;
  }
}

function viewerFromContext(context: AccountContext): Viewer | null {
  if (context.accountState !== "active") return null;
  const supporter = Boolean(context.entitlementId);
  return {
    id: context.userId,
    accessTier: supporter ? "supporter" : "member",
    activeEntitlementId: context.entitlementId,
    activeEntitlementUntil: context.entitlementEffectiveUntil,
    entitlementLifetime: context.entitlementLifetime,
  };
}

export async function getViewer(): Promise<Viewer | null> {
  const context = await getAccountContext();
  return context ? viewerFromContext(context) : null;
}

export async function requireViewer(next: string): Promise<Viewer> {
  const context = await getAccountContext();
  if (!context) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (context.accountState === "pending_age")
    redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  if (context.accountState === "restricted") redirect("/onboarding/ineligible");
  const viewer = viewerFromContext(context);
  if (!viewer) redirect("/login?error=account_unavailable");
  return viewer;
}
