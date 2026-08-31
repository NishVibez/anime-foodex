import type {
  Difficulty,
  RecommendationChoice,
  RecommendationRecipe,
  RecommendationRequest,
  RecommendationResult,
} from "./contracts";

export const RECOMMENDATION_ALGORITHM_VERSION = "2026-08-30.1";

const DIFFICULTY_RANK: Readonly<Record<Difficulty, number>> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function ingredientMatches(candidate: string, query: string): boolean {
  const candidateValue = normalize(candidate);
  const queryValue = normalize(query);

  if (!candidateValue || !queryValue) return false;
  return (
    candidateValue === queryValue ||
    candidateValue.startsWith(`${queryValue} `) ||
    candidateValue.endsWith(` ${queryValue}`)
  );
}

function containsAnyIngredient(
  recipe: RecommendationRecipe,
  queries: readonly string[],
): boolean {
  const names = [
    ...recipe.ingredientNames,
    ...(recipe.ingredientAliases ?? []),
  ];
  return queries.some((query) =>
    names.some((candidate) => ingredientMatches(candidate, query)),
  );
}

function passesHardConstraints(
  recipe: RecommendationRecipe,
  request: RecommendationRequest,
): boolean {
  if (
    request.allergens.some((allergen) => recipe.allergens.includes(allergen))
  ) {
    return false;
  }

  if (
    request.dietaryRequirements.some(
      (requirement) => !recipe.dietaryTags.includes(requirement),
    )
  ) {
    return false;
  }

  return !containsAnyIngredient(recipe, request.dislikedIngredients);
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values.map(normalize).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "en"),
  );
}

function scoreRecipe(
  recipe: RecommendationRecipe,
  request: RecommendationRequest,
): RecommendationChoice {
  const pantry = uniqueSorted(recipe.pantryStaples ?? []);
  const requiredIngredients = uniqueSorted(recipe.ingredientNames).filter(
    (ingredient) => !pantry.some((item) => ingredientMatches(ingredient, item)),
  );
  const available = uniqueSorted(request.availableIngredients);
  const matchedIngredients = requiredIngredients.filter((ingredient) =>
    available.some((item) => ingredientMatches(ingredient, item)),
  );
  const missingIngredients = requiredIngredients.filter(
    (ingredient) => !matchedIngredients.includes(ingredient),
  );

  let score = 100;
  score += matchedIngredients.length * 14;
  score -= missingIngredients.length * 4;

  const moods = new Set(recipe.moods.map(normalize));
  const matchedMoods = uniqueSorted(request.mood).filter((mood) =>
    moods.has(mood),
  );
  score += matchedMoods.length * 18;

  const minutesDelta = request.maximumTotalMinutes - recipe.totalMinutes;
  score += minutesDelta >= 0 ? 20 : Math.max(-35, minutesDelta);

  const skillDelta =
    DIFFICULTY_RANK[request.skill] - DIFFICULTY_RANK[recipe.difficulty];
  score += skillDelta >= 0 ? 12 : skillDelta * 12;
  score += recipe.markets.includes(request.market) ? 10 : -6;

  const reasons: string[] = [];
  if (matchedIngredients.length > 0) {
    reasons.push(
      `Uses ${matchedIngredients.length} ingredient${matchedIngredients.length === 1 ? "" : "s"} you already have.`,
    );
  } else {
    reasons.push(
      "A fresh option when your listed ingredients do not decide the meal.",
    );
  }
  if (matchedMoods.length > 0) {
    reasons.push(`Fits your ${matchedMoods.slice(0, 2).join(" and ")} mood.`);
  }
  if (recipe.totalMinutes <= request.maximumTotalMinutes) {
    reasons.push(
      `Fits within your ${request.maximumTotalMinutes}-minute window.`,
    );
  } else {
    reasons.push(
      `Takes about ${recipe.totalMinutes - request.maximumTotalMinutes} minutes longer than requested.`,
    );
  }
  if (recipe.markets.includes(request.market)) {
    reasons.push("Its core ingredients are commonly available in your region.");
  }

  return {
    recipeId: recipe.id,
    title: recipe.title,
    score,
    matchedIngredients,
    missingIngredients,
    reasons: reasons.slice(0, 3),
  };
}

/**
 * Returns two best-fit choices and a distinct, constraint-safe wildcard.
 * No randomness or current time is used; equal inputs always produce equal output.
 */
export function recommendRecipes(
  recipes: readonly RecommendationRecipe[],
  request: RecommendationRequest,
): RecommendationResult {
  const eligible = recipes.filter((recipe) =>
    passesHardConstraints(recipe, request),
  );
  const scored = eligible
    .map((recipe) => ({ recipe, choice: scoreRecipe(recipe, request) }))
    .sort(
      (left, right) =>
        right.choice.score - left.choice.score ||
        left.recipe.id.localeCompare(right.recipe.id, "en"),
    );

  const choices = scored.slice(0, 2).map(({ choice }) => choice);
  const chosenIds = new Set(choices.map((choice) => choice.recipeId));
  const wildcardCandidate = scored
    .filter(({ recipe }) => !chosenIds.has(recipe.id))
    .sort(
      (left, right) =>
        right.recipe.wildcardSafety - left.recipe.wildcardSafety ||
        left.recipe.totalMinutes - right.recipe.totalMinutes ||
        right.choice.score - left.choice.score ||
        left.recipe.id.localeCompare(right.recipe.id, "en"),
    )[0];

  const wildcard = wildcardCandidate
    ? {
        ...wildcardCandidate.choice,
        reasons: [
          "A safe wildcard that still respects every dietary, allergy, and dislike rule.",
          ...wildcardCandidate.choice.reasons,
        ].slice(0, 3),
      }
    : null;

  return {
    choices,
    wildcard,
    excludedCount: recipes.length - eligible.length,
    evaluatedCount: eligible.length,
    algorithmVersion: RECOMMENDATION_ALGORITHM_VERSION,
  };
}

export const recommendationInternals = {
  normalize,
  ingredientMatches,
  passesHardConstraints,
};
