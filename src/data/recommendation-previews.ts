import type {
  Allergen,
  DietaryTag,
  Difficulty,
  MarketCode,
  RecommendationRecipe,
} from "../domain/contracts";

type RecommendationPreview = {
  readonly id: string;
  readonly slug: string;
};

type SafeDefinition = RecommendationPreview & {
  readonly title: string;
  readonly prepMinutes: number;
  readonly cookMinutes: number;
  readonly difficulty: Difficulty;
  readonly dietaryTags: readonly DietaryTag[];
  readonly allergens: readonly Allergen[];
  readonly moods: readonly string[];
  readonly markets: readonly MarketCode[];
  readonly wildcardSafety: number;
  readonly ingredientNames: readonly string[];
  readonly ingredientAliases?: readonly string[];
  readonly pantryStaples?: readonly string[];
};

/**
 * Deliberately preview-safe recommendation data. This module is imported by a
 * Client Component, so it must never contain quantities, instructions,
 * equipment, substitutions, or other protected recipe-detail fields.
 */
const SAFE_DEFINITIONS: readonly SafeDefinition[] = [
  {
    id: "original-recipe-001",
    slug: "cozy-miso-mushroom-rice",
    title: "Cozy Miso Mushroom Rice",
    prepMinutes: 10,
    cookMinutes: 25,
    difficulty: "beginner",
    dietaryTags: ["vegan", "vegetarian", "dairy_free", "egg_free", "nut_free"],
    allergens: ["soy"],
    moods: ["cozy", "comforting", "quiet"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 10,
    ingredientNames: [
      "short-grain rice",
      "shiitake mushrooms",
      "white miso",
      "scallions",
    ],
    ingredientAliases: ["sushi rice", "mushrooms", "spring onions"],
    pantryStaples: ["water"],
  },
  {
    id: "original-recipe-002",
    slug: "jade-scallion-onigiri",
    title: "Jade Scallion Onigiri",
    prepMinutes: 15,
    cookMinutes: 20,
    difficulty: "beginner",
    dietaryTags: [
      "vegan",
      "vegetarian",
      "gluten_free",
      "dairy_free",
      "egg_free",
      "nut_free",
    ],
    allergens: ["sesame"],
    moods: ["picnic", "cheerful", "nostalgic"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 9,
    ingredientNames: ["short-grain rice", "scallions", "toasted sesame seeds"],
    ingredientAliases: ["sushi rice", "spring onions"],
    pantryStaples: ["salt"],
  },
  {
    id: "original-recipe-003",
    slug: "saffron-coconut-curry-udon",
    title: "Saffron Coconut Curry Udon",
    prepMinutes: 12,
    cookMinutes: 18,
    difficulty: "intermediate",
    dietaryTags: ["vegan", "vegetarian", "dairy_free", "egg_free", "nut_free"],
    allergens: ["gluten", "soy"],
    moods: ["bold", "comforting", "rainy"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 7,
    ingredientNames: [
      "udon noodles",
      "coconut milk",
      "mild curry powder",
      "soy sauce",
      "carrots",
    ],
  },
  {
    id: "original-recipe-004",
    slug: "campfire-tomato-bean-stew",
    title: "Campfire Tomato Bean Stew",
    prepMinutes: 10,
    cookMinutes: 30,
    difficulty: "beginner",
    dietaryTags: [
      "vegan",
      "vegetarian",
      "gluten_free",
      "dairy_free",
      "egg_free",
      "nut_free",
    ],
    allergens: [],
    moods: ["adventurous", "rustic", "comforting"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 10,
    ingredientNames: [
      "canned white beans",
      "canned tomatoes",
      "red bell pepper",
      "smoked paprika",
    ],
    ingredientAliases: ["white beans", "tomatoes", "capsicum"],
    pantryStaples: ["salt"],
  },
  {
    id: "original-recipe-005",
    slug: "vermilion-tofu-donburi",
    title: "Vermilion Tofu Donburi",
    prepMinutes: 15,
    cookMinutes: 20,
    difficulty: "intermediate",
    dietaryTags: ["vegan", "vegetarian", "dairy_free", "egg_free", "nut_free"],
    allergens: ["soy"],
    moods: ["energized", "bold", "heroic"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 7,
    ingredientNames: [
      "firm tofu",
      "cooked rice",
      "red bell pepper",
      "fresh ginger",
      "soy sauce",
    ],
    ingredientAliases: ["capsicum"],
  },
  {
    id: "original-recipe-006",
    slug: "golden-corn-ramen",
    title: "Golden Corn Ramen",
    prepMinutes: 10,
    cookMinutes: 15,
    difficulty: "beginner",
    dietaryTags: ["vegan", "vegetarian", "dairy_free", "egg_free", "nut_free"],
    allergens: ["gluten", "sesame", "soy"],
    moods: ["quick", "comforting", "playful"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 8,
    ingredientNames: [
      "ramen noodles",
      "sweet corn",
      "soy milk",
      "sesame oil",
      "fresh ginger",
    ],
    ingredientAliases: ["corn"],
  },
  {
    id: "original-recipe-007",
    slug: "citrus-miso-salmon",
    title: "Citrus Miso Salmon",
    prepMinutes: 15,
    cookMinutes: 14,
    difficulty: "intermediate",
    dietaryTags: [
      "pescatarian",
      "gluten_free",
      "dairy_free",
      "egg_free",
      "nut_free",
    ],
    allergens: ["fish", "soy"],
    moods: ["elegant", "bright", "celebratory"],
    markets: ["NA", "EU", "OTHER"],
    wildcardSafety: 5,
    ingredientNames: ["salmon fillets", "white miso", "orange", "cucumber"],
    ingredientAliases: ["salmon"],
  },
  {
    id: "original-recipe-008",
    slug: "lantern-tamago-sando",
    title: "Lantern Tamago Sando",
    prepMinutes: 15,
    cookMinutes: 10,
    difficulty: "beginner",
    dietaryTags: ["vegetarian", "nut_free"],
    allergens: ["egg", "gluten", "milk", "mustard"],
    moods: ["picnic", "cheerful", "quick"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 6,
    ingredientNames: ["eggs", "milk bread", "mayonnaise", "chives"],
  },
  {
    id: "original-recipe-009",
    slug: "black-sesame-moon-pudding",
    title: "Black Sesame Moon Pudding",
    prepMinutes: 10,
    cookMinutes: 12,
    difficulty: "intermediate",
    dietaryTags: [
      "vegan",
      "vegetarian",
      "gluten_free",
      "dairy_free",
      "egg_free",
      "nut_free",
    ],
    allergens: ["sesame"],
    moods: ["mysterious", "calm", "celebratory"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 7,
    ingredientNames: ["black sesame seeds", "oat milk", "cornstarch"],
    ingredientAliases: ["corn flour"],
    pantryStaples: ["sugar"],
  },
  {
    id: "original-recipe-010",
    slug: "matcha-pear-parfait",
    title: "Matcha Pear Parfait",
    prepMinutes: 15,
    cookMinutes: 5,
    difficulty: "beginner",
    dietaryTags: ["vegetarian", "egg_free", "nut_free"],
    allergens: ["gluten", "milk"],
    moods: ["bright", "celebratory", "calm"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 8,
    ingredientNames: [
      "ripe pear",
      "plain yogurt",
      "matcha",
      "rolled oats",
      "honey",
    ],
    ingredientAliases: ["pear"],
  },
] as const;

export const representativeRecipePreviews: readonly RecommendationPreview[] =
  SAFE_DEFINITIONS.map(({ id, slug }) => ({ id, slug }));

export const representativeRecommendationRecipes: readonly RecommendationRecipe[] =
  SAFE_DEFINITIONS.map((definition) => ({
    id: definition.id,
    title: definition.title,
    ingredientNames: definition.ingredientNames,
    ingredientAliases: definition.ingredientAliases ?? [],
    pantryStaples: definition.pantryStaples ?? [],
    moods: definition.moods,
    totalMinutes: definition.prepMinutes + definition.cookMinutes,
    difficulty: definition.difficulty,
    dietaryTags: definition.dietaryTags,
    allergens: definition.allergens,
    markets: definition.markets,
    wildcardSafety: definition.wildcardSafety,
  }));
