import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient, getVerifiedClaims } from "@/lib/supabase/server";

const schema = z.object({
  title: z.string().trim().min(1).max(150),
  sourceDeclaration: z.string().trim().min(10).max(3000),
  context: z.string().trim().max(2000),
  licenseAccepted: z.literal(true),
});

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== new URL(process.env.NEXT_PUBLIC_SITE_URL ?? request.url).origin
  )
    return NextResponse.json(
      { error: "Origin check failed." },
      { status: 403 },
    );
  if (!(await getVerifiedClaims()))
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      {
        error:
          "Complete the title, source declaration, and contributor license.",
      },
      { status: 400 },
    );
  const { data, error } = await (
    await createClient()
  ).rpc("submit_recipe_suggestion", {
    p_title: parsed.data.title,
    p_source_declaration: parsed.data.sourceDeclaration,
    p_payload: { context: parsed.data.context },
    p_license_accepted: parsed.data.licenseAccepted,
  });
  if (error || !data)
    return NextResponse.json(
      { error: "The suggestion could not enter review." },
      { status: 409 },
    );
  return NextResponse.json(
    { submissionId: data, state: "submitted" },
    { status: 201 },
  );
}
