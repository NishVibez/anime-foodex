import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth/viewer";

export async function GET() {
  const viewer = await getViewer();
  if (!viewer)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  return NextResponse.json(
    {
      ownerId: viewer.id,
      entitlementId: viewer.activeEntitlementId ?? `member:${viewer.id}`,
      tier: viewer.accessTier,
      effectiveUntil: viewer.entitlementLifetime
        ? null
        : viewer.activeEntitlementUntil,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
