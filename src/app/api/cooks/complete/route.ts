import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient, getVerifiedClaims } from "@/lib/supabase/server";

const schema = z.object({
  recipeId: z.uuid(),
  recipeVersionId: z.uuid(),
  idempotencyKey: z.string().uuid(),
  servings: z.number().positive().max(100),
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
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid completion event." },
      { status: 400 },
    );
  if (!(await getVerifiedClaims()))
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("complete_cook", {
    p_recipe_id: parsed.data.recipeId,
    p_recipe_version_id: parsed.data.recipeVersionId,
    p_idempotency_key: parsed.data.idempotencyKey,
    p_servings: parsed.data.servings,
  });
  const result = data?.[0];
  if (error || !result)
    return NextResponse.json(
      { error: "Cook completion was not accepted." },
      { status: 409 },
    );
  return NextResponse.json({
    cookLogId: result.cook_log_id,
    awardedXp: result.awarded_xp,
    totalXp: result.total_xp,
    duplicate: result.was_duplicate,
  });
}
