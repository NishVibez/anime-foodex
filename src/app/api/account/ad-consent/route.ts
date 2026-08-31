import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient, getVerifiedClaims } from "@/lib/supabase/server";

const schema = z.object({ granted: z.boolean() });

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
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid consent choice." },
      { status: 400 },
    );
  const { data, error } = await (
    await createClient()
  ).rpc("record_personalized_ads_consent", {
    p_granted: parsed.data.granted,
    p_policy_version: "ga-2026-08-draft",
    p_request_id: crypto.randomUUID(),
  });
  if (error)
    return NextResponse.json(
      { error: "The consent choice could not be recorded." },
      { status: 409 },
    );
  return NextResponse.json({ state: data });
}
