import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

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
  const { error } = await (
    await createClient()
  ).auth.signOut({ scope: "global" });
  if (error)
    return NextResponse.json({ error: "Sign out failed." }, { status: 503 });
  return new NextResponse(null, { status: 204 });
}
