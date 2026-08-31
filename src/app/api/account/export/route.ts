import { NextResponse } from "next/server";

import { createSecretClient } from "@/lib/supabase/secret";
import { getVerifiedClaims } from "@/lib/supabase/server";

function hasAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(
    origin &&
    origin === new URL(process.env.NEXT_PUBLIC_SITE_URL ?? request.url).origin,
  );
}

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request))
    return NextResponse.json(
      { error: "Origin check failed." },
      { status: 403 },
    );
  const claims = await getVerifiedClaims();
  const userId = typeof claims?.sub === "string" ? claims.sub : null;
  if (!userId)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data, error } = await createSecretClient().rpc(
    "export_account_data",
    { p_user_id: userId },
  );
  if (error || !data)
    return NextResponse.json(
      { error: "The export could not be generated." },
      { status: 503 },
    );
  return new NextResponse(
    JSON.stringify({ format: "anime-foodex-account-export-v1", data }, null, 2),
    {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="anime-foodex-export-${new Date().toISOString().slice(0, 10)}.json"`,
        "Content-Type": "application/json; charset=utf-8",
        "X-Robots-Tag": "noindex, noarchive",
      },
    },
  );
}
