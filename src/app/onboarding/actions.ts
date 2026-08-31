"use server";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { z } from "zod";

import { safeRelativePath } from "@/lib/http/safe-path";
import { createClient, getVerifiedClaims } from "@/lib/supabase/server";

const onboardingSchema = z.object({
  country: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}$/),
  birthDate: z.iso.date(),
  next: z.string(),
});

export async function completeOnboarding(formData: FormData) {
  const parsed = onboardingSchema.safeParse({
    country: formData.get("country"),
    birthDate: formData.get("birthDate"),
    next: formData.get("next") || "/vault",
  });
  if (!parsed.success) redirect("/onboarding?error=invalid");

  const claims = await getVerifiedClaims();
  if (!claims) redirect("/login?next=/onboarding");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("complete_age_gate", {
    p_country_code: parsed.data.country,
    p_date_of_birth: parsed.data.birthDate,
  });
  const result = data?.[0];
  if (error || !result) redirect("/onboarding?error=unavailable");
  if (result.account_state !== "active") redirect("/onboarding/ineligible");
  redirect(safeRelativePath(parsed.data.next) as Route);
}
