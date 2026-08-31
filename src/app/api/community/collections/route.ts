import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient, getVerifiedClaims } from "@/lib/supabase/server";

const schema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).default(""),
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
      { error: "Collection fields are invalid." },
      { status: 400 },
    );
  const { data, error } = await (
    await createClient()
  ).rpc("create_private_collection", {
    p_title: parsed.data.title,
    p_description: parsed.data.description,
  });
  if (error || !data)
    return NextResponse.json(
      {
        error:
          "The collection could not be created. Free accounts can keep up to five.",
      },
      { status: 409 },
    );
  return NextResponse.json({ collectionId: data }, { status: 201 });
}
