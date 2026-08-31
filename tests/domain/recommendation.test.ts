import { describe, expect, it } from "vitest";

import { representativeRecommendationRecipes } from "../../src/data";
import type {
  RecommendationRecipe,
  RecommendationRequest,
} from "../../src/domain";
import { recommendRecipes } from "../../src/domain";

const request: RecommendationRequest = {
  availableIngredients: [
    "udon noodles",
    "coconut milk",
    "carrots",
    "firm tofu",
  ],
  mood: ["comforting", "bold"],
  maximumTotalMinutes: 40,
  skill: "intermediate",
  dietaryRequirements: ["vegan"],
  allergens: ["sesame"],
  dislikedIngredients: ["mushrooms"],
  market: "IN",
  unitSystem: "metric",
};

describe("recommendRecipes", () => {
  it("returns two personalized choices and one distinct safe wildcard", () => {
    const result = recommendRecipes(
      representativeRecommendationRecipes,
      request,
    );

    expect(result.choices).toHaveLength(2);
    expect(result.wildcard).not.toBeNull();
    expect(result.choices.map((choice) => choice.recipeId)).not.toContain(
      result.wildcard?.recipeId,
    );
    expect(result.wildcard?.reasons[0]).toContain("respects every");
  });

  it("hard-excludes dietary mismatches, allergens, and disliked ingredients", () => {
    const result = recommendRecipes(
      representativeRecommendationRecipes,
      request,
    );
    const selectedIds = [
      ...result.choices.map((choice) => choice.recipeId),
      result.wildcard?.recipeId,
    ];

    expect(selectedIds).not.toContain("original-recipe-001"); // mushrooms
    expect(selectedIds).not.toContain("original-recipe-002"); // sesame
    expect(selectedIds).not.toContain("original-recipe-008"); // egg/dairy and not vegan
    expect(result.excludedCount).toBeGreaterThan(0);
  });

  it("is byte-for-byte deterministic for equal input", () => {
    const first = recommendRecipes(
      representativeRecommendationRecipes,
      request,
    );
    const second = recommendRecipes(
      representativeRecommendationRecipes,
      request,
    );
    expect(second).toEqual(first);
  });

  it("penalizes missing normal ingredients without excluding the recipe", () => {
    const candidates: RecommendationRecipe[] = [
      {
        id: "has-ingredients",
        title: "Has ingredients",
        ingredientNames: ["rice", "tofu"],
        moods: ["cozy"],
        totalMinutes: 20,
        difficulty: "beginner",
        dietaryTags: ["vegan"],
        allergens: [],
        markets: ["IN"],
        wildcardSafety: 5,
      },
      {
        id: "missing-ingredients",
        title: "Missing ingredients",
        ingredientNames: ["lentils", "spinach"],
        moods: ["cozy"],
        totalMinutes: 20,
        difficulty: "beginner",
        dietaryTags: ["vegan"],
        allergens: [],
        markets: ["IN"],
        wildcardSafety: 4,
      },
      {
        id: "wildcard",
        title: "Wildcard",
        ingredientNames: ["tomato"],
        moods: ["bright"],
        totalMinutes: 15,
        difficulty: "beginner",
        dietaryTags: ["vegan"],
        allergens: [],
        markets: ["IN"],
        wildcardSafety: 10,
      },
    ];
    const result = recommendRecipes(candidates, {
      ...request,
      availableIngredients: ["rice", "tofu"],
      allergens: [],
      dislikedIngredients: [],
      mood: ["cozy"],
    });

    expect(result.choices[0]?.recipeId).toBe("has-ingredients");
    expect(result.choices[0]?.score).toBeGreaterThan(
      result.choices[1]?.score ?? -1,
    );
  });
});
