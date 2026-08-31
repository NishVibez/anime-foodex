import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { sanitizeCommunityImage } from "@/lib/moderation/image-safety";
import { moderateCommunityContent } from "@/lib/moderation/moderate";
import { createSecretClient } from "@/lib/supabase/secret";
import { createClient, getVerifiedClaims } from "@/lib/supabase/server";

export const runtime = "nodejs";

const fields = z.object({
  body: z.string().trim().min(1).max(2000),
  visibility: z.enum(["public", "followers", "private"]),
  altText: z.string().trim().max(300).default(""),
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
  const claims = await getVerifiedClaims();
  const userId = typeof claims?.sub === "string" ? claims.sub : null;
  if (!userId)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  try {
    const form = await request.formData();
    const parsed = fields.safeParse({
      body: form.get("body"),
      visibility: form.get("visibility"),
      altText: form.get("altText") ?? "",
    });
    if (!parsed.success)
      return NextResponse.json(
        { error: "Post fields are invalid." },
        { status: 400 },
      );

    const photo = form.get("photo");
    let raw: Buffer | null = null;
    let image: Awaited<ReturnType<typeof sanitizeCommunityImage>> | null = null;
    if (photo instanceof File && photo.size > 0) {
      if (photo.size > 10 * 1_024 * 1_024)
        return NextResponse.json(
          { error: "Photos must be 10 MB or smaller." },
          { status: 413 },
        );
      raw = Buffer.from(await photo.arrayBuffer());
      image = await sanitizeCommunityImage(raw);
    }

    const supabase = await createClient();
    const { data: submission, error: submissionError } = await supabase.rpc(
      "create_post_submission",
      { p_body: parsed.data.body, p_visibility: parsed.data.visibility },
    );
    const created = submission?.[0];
    if (submissionError || !created)
      return NextResponse.json(
        { error: "Posting is unavailable or cooling down." },
        { status: 429 },
      );

    let quarantinePath: string | null = null;
    let sanitizedPath: string | null = null;
    const secret = createSecretClient();
    if (raw && image) {
      quarantinePath = `${userId}/${created.post_id}/${randomUUID()}.${image.originalExtension}`;
      const { error: quarantineError } = await secret.storage
        .from("ugc-quarantine")
        .upload(quarantinePath, raw, {
          contentType: image.originalMime,
          upsert: false,
        });
      if (quarantineError)
        return NextResponse.json(
          {
            error:
              "Photo could not enter quarantine; the draft remains private.",
          },
          { status: 503 },
        );
    }

    const moderation = await moderateCommunityContent({
      text: parsed.data.body,
      image: image?.sanitizedBuffer,
    });
    if (image && moderation.outcome === "auto_passed") {
      sanitizedPath = `${userId}/${created.post_id}/${image.sha256}.webp`;
      const { error: sanitizedError } = await secret.storage
        .from("ugc-sanitized")
        .upload(sanitizedPath, image.sanitizedBuffer, {
          contentType: image.sanitizedMime,
          upsert: false,
        });
      if (sanitizedError) sanitizedPath = null;
    }

    const { data: applied, error: applyError } = await secret.rpc(
      "apply_post_moderation",
      {
        p_post_id: created.post_id,
        p_outcome: moderation.outcome,
        p_quarantine_path: quarantinePath,
        p_sanitized_path: sanitizedPath,
        p_sha256: image?.sha256 ?? null,
        p_mime_type: image?.sanitizedMime ?? null,
        p_width: image?.width ?? null,
        p_height: image?.height ?? null,
        p_alt_text: parsed.data.altText,
      },
    );
    if (applyError || !applied?.[0]) {
      if (sanitizedPath)
        await secret.storage.from("ugc-sanitized").remove([sanitizedPath]);
      return NextResponse.json(
        { error: "The post is held for owner review." },
        { status: 202 },
      );
    }
    if (quarantinePath && sanitizedPath)
      await secret.storage.from("ugc-quarantine").remove([quarantinePath]);
    return NextResponse.json(
      {
        postId: created.post_id,
        state: applied[0].final_state,
        ownerReview: created.requires_owner_approval,
        reasons: moderation.reasons,
      },
      { status: applied[0].final_state === "auto_passed" ? 201 : 202 },
    );
  } catch (error) {
    console.error("community_post_submission_failed", {
      message: error instanceof Error ? error.message : "unknown",
      userId,
    });
    return NextResponse.json(
      {
        error:
          "The submission could not be accepted and nothing was published.",
      },
      { status: 400 },
    );
  }
}
