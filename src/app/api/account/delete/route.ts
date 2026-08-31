import { NextResponse } from "next/server";

import { createClient, getVerifiedClaims } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== new URL(process.env.NEXT_PUBLIC_SITE_URL ?? request.url).origin
  ) {
    return NextResponse.json(
      { error: "Origin check failed." },
      { status: 403 },
    );
  }
  if (!(await getVerifiedClaims()))
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("request_account_deletion", {
    p_request_id: crypto.randomUUID(),
  });
  if (error || !data)
    return NextResponse.json(
      { error: "The deletion request could not be recorded." },
      { status: 503 },
    );
  await supabase.auth.signOut({ scope: "global" });
  return NextResponse.json({ requestedAt: data });
}
