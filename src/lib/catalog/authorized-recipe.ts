import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AuthorizedRecipe = {
  id: string;
  versionId: string;
  slug: string;
  title: string;
  description: string;
  teaser: string;
  servings: number;
  yieldUnit: string;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: string;
  accessTier: string;
  allergens: string[];
  dietaryTags: string[];
  provenance: string;
  ingredients: Array<{
    id: number;
    position: number;
    name: string;
    amountMin: number | null;
    amountMax: number | null;
    unit: string | null;
    preparation: string;
    optional: boolean;
    group: string;
  }>;
  steps: Array<{
    id: number;
    position: number;
    instruction: string;
    timerSeconds: number | null;
    temperatureC: number | null;
    safetyNote: string;
    group: string;
  }>;
};

export async function getAuthorizedRecipe(
  slug: string,
): Promise<AuthorizedRecipe | null> {
  const supabase = await createClient();
  const { data: recipe, error } = await supabase
    .from("recipe_details")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !recipe) return null;

  const [{ data: ingredients }, { data: steps }] = await Promise.all([
    supabase
      .from("recipe_ingredients")
      .select("*")
      .eq("recipe_version_id", recipe.recipe_version_id)
      .order("position"),
    supabase
      .from("recipe_steps")
      .select("*")
      .eq("recipe_version_id", recipe.recipe_version_id)
      .order("position"),
  ]);

  return {
    id: recipe.id,
    versionId: recipe.recipe_version_id,
    slug: recipe.slug,
    title: recipe.title,
    description: recipe.description,
    teaser: recipe.teaser,
    servings: recipe.yield_quantity,
    yieldUnit: recipe.yield_unit,
    prepMinutes: recipe.prep_minutes,
    cookMinutes: recipe.cook_minutes,
    difficulty: recipe.difficulty,
    accessTier: recipe.access_tier,
    allergens: recipe.allergen_summary,
    dietaryTags: recipe.dietary_tags,
    provenance: recipe.provenance_note,
    ingredients: (ingredients ?? []).map((ingredient) => ({
      id: ingredient.id,
      position: ingredient.position,
      name: ingredient.name,
      amountMin: ingredient.quantity_min,
      amountMax: ingredient.quantity_max,
      unit: ingredient.unit_code,
      preparation: ingredient.preparation,
      optional: ingredient.optional,
      group: ingredient.group_label,
    })),
    steps: (steps ?? []).map((step) => ({
      id: step.id,
      position: step.position,
      instruction: step.instruction,
      timerSeconds: step.timer_seconds,
      temperatureC: step.temperature_c,
      safetyNote: step.safety_note,
      group: step.group_label,
    })),
  };
}
