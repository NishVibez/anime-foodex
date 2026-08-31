import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth/viewer";
import { getAuthorizedRecipe } from "@/lib/catalog/authorized-recipe";
import { createBoundOfflineLease } from "@/domain/entitlements";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const viewer = await getViewer();
  if (!viewer)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const recipe = await getAuthorizedRecipe(slug);
  if (!recipe)
    return NextResponse.json({ error: "Recipe unavailable." }, { status: 404 });
  const lease = createBoundOfflineLease({
    entitlementId: viewer.activeEntitlementId ?? `member:${viewer.id}`,
    effectiveUntil: viewer.entitlementLifetime
      ? null
      : viewer.activeEntitlementUntil,
    issuedAt: new Date(),
    durationMs:
      viewer.accessTier === "supporter"
        ? 30 * 24 * 60 * 60 * 1_000
        : 24 * 60 * 60 * 1_000,
  });
  const expiresAt = Date.parse(lease.expiresAt);
  return NextResponse.json(
    {
      recipe,
      lease: {
        tier: viewer.accessTier,
        entitlementId: lease.entitlementId,
        ownerId: viewer.id,
        expiresAt: lease.expiresAt,
      },
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Foodex-Offline-Allowed": "1",
        "X-Foodex-Offline-Lease-Expires": String(expiresAt),
        "X-Foodex-Offline-Owner": viewer.id,
        "X-Foodex-Offline-Entitlement": lease.entitlementId,
        "X-Robots-Tag": "noindex, noarchive",
      },
    },
  );
}
