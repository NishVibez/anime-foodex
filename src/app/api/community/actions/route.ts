import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient, getVerifiedClaims } from "@/lib/supabase/server";

const action = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("follow"),
    targetId: z.uuid(),
    active: z.boolean(),
  }),
  z.object({
    kind: z.literal("block"),
    targetId: z.uuid(),
    active: z.boolean(),
  }),
  z.object({
    kind: z.literal("react"),
    targetId: z.uuid(),
    reaction: z.enum(["like", "yum", "inspired"]),
    active: z.boolean(),
  }),
  z.object({
    kind: z.literal("report"),
    targetId: z.uuid(),
    targetType: z.enum([
      "profile",
      "post",
      "comment",
      "review",
      "collection",
      "submission",
    ]),
    reason: z.enum([
      "harassment",
      "spam",
      "privacy",
      "unsafe_food",
      "infringement",
      "sexual_or_violent",
      "minor_safety",
      "other",
    ]),
    detail: z.string().trim().max(2000).default(""),
  }),
  z.object({ kind: z.literal("notification_read"), targetId: z.uuid() }),
]);

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
  const parsed = action.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid community action." },
      { status: 400 },
    );
  const supabase = await createClient();
  const input = parsed.data;
  const result =
    input.kind === "follow"
      ? await supabase.rpc("follow_user", {
          target_user_id: input.targetId,
          should_follow: input.active,
        })
      : input.kind === "block"
        ? await supabase.rpc("block_user", {
            target_user_id: input.targetId,
            should_block: input.active,
          })
        : input.kind === "react"
          ? await supabase.rpc("react_to_post", {
              p_post_id: input.targetId,
              p_kind: input.reaction,
              p_active: input.active,
            })
          : input.kind === "report"
            ? await supabase.rpc("report_content", {
                p_target_type: input.targetType,
                p_target_id: input.targetId,
                p_reason: input.reason,
                p_detail: input.detail,
              })
            : await supabase.rpc("mark_notification_read", {
                p_notification_id: input.targetId,
              });
  if (result.error)
    return NextResponse.json(
      { error: "The action is unavailable." },
      { status: 409 },
    );
  return NextResponse.json({ applied: true, value: result.data });
}
