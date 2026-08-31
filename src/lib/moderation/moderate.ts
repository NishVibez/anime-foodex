import "server-only";

import OpenAI from "openai";

export type ModerationDecision = {
  outcome: "auto_passed" | "flagged" | "pending";
  reasons: string[];
};

function localSignals(text: string) {
  const reasons: string[] = [];
  const links = text.match(/https?:\/\//gi)?.length ?? 0;
  if (links > 2) reasons.push("link_limit");
  if (/(.)\1{12,}/u.test(text)) reasons.push("repeated_character_spam");
  if (
    /\b(?:guaranteed cure|miracle detox|instant followers|buy followers)\b/iu.test(
      text,
    )
  )
    reasons.push("spam_or_medical_claim");
  if (/\b(?:eat raw chicken|drink bleach|cook in sealed glass)\b/iu.test(text))
    reasons.push("unsafe_cooking_instruction");
  return reasons;
}

export async function moderateCommunityContent(input: {
  text: string;
  image?: Buffer;
}): Promise<ModerationDecision> {
  const local = localSignals(input.text);
  if (local.length) return { outcome: "flagged", reasons: local };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey)
    return { outcome: "pending", reasons: ["moderation_service_unconfigured"] };
  try {
    const client = new OpenAI({ apiKey });
    const moderationInput: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > = [{ type: "text", text: input.text }];
    if (input.image)
      moderationInput.push({
        type: "image_url",
        image_url: {
          url: `data:image/webp;base64,${input.image.toString("base64")}`,
        },
      });
    const response = await client.moderations.create({
      model: "omni-moderation-2024-09-26",
      input: moderationInput,
    });
    const flagged = response.results.some((result) => result.flagged);
    const reasons = response.results.flatMap((result) =>
      Object.entries(result.categories)
        .filter(([, active]) => active)
        .map(([category]) => category),
    );
    return { outcome: flagged ? "flagged" : "auto_passed", reasons };
  } catch {
    return { outcome: "pending", reasons: ["moderation_service_unavailable"] };
  }
}
