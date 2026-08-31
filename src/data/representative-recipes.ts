import "server-only";

import type {
  Allergen,
  DietaryTag,
  Difficulty,
  FandomKind,
  MarketCode,
  QuantityUnit,
  RecipeDetail,
  RecommendationRecipe,
} from "../domain/contracts";

interface OriginalRecipeDefinition {
  readonly slug: string;
  readonly title: string;
  readonly teaser: string;
  readonly kind: FandomKind;
  readonly access: "standard" | "supporter";
  readonly prepMinutes: number;
  readonly cookMinutes: number;
  readonly difficulty: Difficulty;
  readonly servings: number;
  readonly dietaryTags: readonly DietaryTag[];
  readonly allergens: readonly Allergen[];
  readonly moods: readonly string[];
  readonly markets: readonly MarketCode[];
  readonly wildcardSafety: number;
  readonly ingredients: readonly {
    readonly name: string;
    readonly amount: number;
    readonly unit: QuantityUnit;
    readonly allergens?: readonly Allergen[];
    readonly optional?: boolean;
    readonly pantry?: boolean;
    readonly aliases?: readonly string[];
  }[];
  readonly steps: readonly string[];
}

const DEFINITIONS: readonly OriginalRecipeDefinition[] = [
  {
    slug: "cozy-miso-mushroom-rice",
    title: "Cozy Miso Mushroom Rice",
    teaser:
      "A glossy one-pan rice bowl with savory mushrooms and a bright scallion finish.",
    kind: "anime",
    access: "standard",
    prepMinutes: 10,
    cookMinutes: 25,
    difficulty: "beginner",
    servings: 2,
    dietaryTags: ["vegan", "vegetarian", "dairy_free", "egg_free", "nut_free"],
    allergens: ["soy"],
    moods: ["cozy", "comforting", "quiet"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 10,
    ingredients: [
      {
        name: "short-grain rice",
        amount: 180,
        unit: "g",
        aliases: ["sushi rice"],
      },
      {
        name: "shiitake mushrooms",
        amount: 150,
        unit: "g",
        aliases: ["mushrooms"],
      },
      { name: "white miso", amount: 1.5, unit: "tbsp", allergens: ["soy"] },
      {
        name: "scallions",
        amount: 2,
        unit: "piece",
        aliases: ["spring onions"],
      },
      { name: "water", amount: 360, unit: "ml", pantry: true },
    ],
    steps: [
      "Rinse the rice until the water is nearly clear, then drain well.",
      "Brown the sliced mushrooms, stir in the rice and water, then cover and cook gently until tender.",
      "Fold the miso through off the heat and finish with sliced scallions.",
    ],
  },
  {
    slug: "jade-scallion-onigiri",
    title: "Jade Scallion Onigiri",
    teaser: "Hand-shaped rice parcels flecked with greens and toasted sesame.",
    kind: "film",
    access: "standard",
    prepMinutes: 15,
    cookMinutes: 20,
    difficulty: "beginner",
    servings: 4,
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
    ingredients: [
      {
        name: "short-grain rice",
        amount: 300,
        unit: "g",
        aliases: ["sushi rice"],
      },
      {
        name: "scallions",
        amount: 3,
        unit: "piece",
        aliases: ["spring onions"],
      },
      {
        name: "toasted sesame seeds",
        amount: 2,
        unit: "tsp",
        allergens: ["sesame"],
      },
      { name: "salt", amount: 2, unit: "pinch", pantry: true },
    ],
    steps: [
      "Cook the rinsed rice until tender, then rest it covered for ten minutes.",
      "Fold in the sliced scallions and sesame without crushing the grains.",
      "With damp salted hands, shape the warm rice into eight compact triangles.",
    ],
  },
  {
    slug: "saffron-coconut-curry-udon",
    title: "Saffron Coconut Curry Udon",
    teaser:
      "Springy noodles in a mild golden broth built for weeknight comfort.",
    kind: "animation",
    access: "supporter",
    prepMinutes: 12,
    cookMinutes: 18,
    difficulty: "intermediate",
    servings: 2,
    dietaryTags: ["vegan", "vegetarian", "dairy_free", "egg_free", "nut_free"],
    allergens: ["gluten", "soy"],
    moods: ["bold", "comforting", "rainy"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 7,
    ingredients: [
      { name: "udon noodles", amount: 400, unit: "g", allergens: ["gluten"] },
      { name: "coconut milk", amount: 300, unit: "ml" },
      { name: "mild curry powder", amount: 2, unit: "tsp" },
      { name: "soy sauce", amount: 1, unit: "tbsp", allergens: ["soy"] },
      { name: "carrots", amount: 1, unit: "piece" },
    ],
    steps: [
      "Warm the curry powder in a little oil until fragrant, without scorching it.",
      "Add coconut milk, sliced carrot, soy sauce, and water; simmer until the carrot softens.",
      "Add the udon and loosen the strands in the broth before serving immediately.",
    ],
  },
  {
    slug: "campfire-tomato-bean-stew",
    title: "Campfire Tomato Bean Stew",
    teaser:
      "A forgiving pantry stew with smoky tomato, beans, and sweet peppers.",
    kind: "game",
    access: "standard",
    prepMinutes: 10,
    cookMinutes: 30,
    difficulty: "beginner",
    servings: 4,
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
    ingredients: [
      {
        name: "canned white beans",
        amount: 480,
        unit: "g",
        aliases: ["white beans"],
      },
      {
        name: "canned tomatoes",
        amount: 400,
        unit: "g",
        aliases: ["tomatoes"],
      },
      {
        name: "red bell pepper",
        amount: 1,
        unit: "piece",
        aliases: ["capsicum"],
      },
      { name: "smoked paprika", amount: 1, unit: "tsp" },
      { name: "salt", amount: 2, unit: "pinch", pantry: true },
    ],
    steps: [
      "Soften the diced pepper in a sturdy pot over medium heat.",
      "Add tomatoes, beans, paprika, and a splash of water, then simmer uncovered.",
      "Season once the stew has thickened enough to coat a spoon.",
    ],
  },
  {
    slug: "vermilion-tofu-donburi",
    title: "Vermilion Tofu Donburi",
    teaser:
      "Crisp-edged tofu and peppers over rice with a lively ginger glaze.",
    kind: "anime",
    access: "supporter",
    prepMinutes: 15,
    cookMinutes: 20,
    difficulty: "intermediate",
    servings: 2,
    dietaryTags: ["vegan", "vegetarian", "dairy_free", "egg_free", "nut_free"],
    allergens: ["soy"],
    moods: ["energized", "bold", "heroic"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 7,
    ingredients: [
      { name: "firm tofu", amount: 300, unit: "g", allergens: ["soy"] },
      { name: "cooked rice", amount: 400, unit: "g" },
      {
        name: "red bell pepper",
        amount: 1,
        unit: "piece",
        aliases: ["capsicum"],
      },
      { name: "fresh ginger", amount: 15, unit: "g" },
      { name: "soy sauce", amount: 1.5, unit: "tbsp", allergens: ["soy"] },
    ],
    steps: [
      "Pat the tofu dry, cube it, and sear until each side has a crisp edge.",
      "Cook the pepper briefly, then add grated ginger, soy sauce, and a splash of water.",
      "Return the tofu to the glaze and spoon everything over hot rice.",
    ],
  },
  {
    slug: "golden-corn-ramen",
    title: "Golden Corn Ramen",
    teaser: "A quick sweet-corn noodle bowl enriched with sesame and ginger.",
    kind: "animation",
    access: "standard",
    prepMinutes: 10,
    cookMinutes: 15,
    difficulty: "beginner",
    servings: 2,
    dietaryTags: ["vegan", "vegetarian", "dairy_free", "egg_free", "nut_free"],
    allergens: ["gluten", "sesame", "soy"],
    moods: ["quick", "comforting", "playful"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 8,
    ingredients: [
      { name: "ramen noodles", amount: 200, unit: "g", allergens: ["gluten"] },
      { name: "sweet corn", amount: 180, unit: "g", aliases: ["corn"] },
      { name: "soy milk", amount: 300, unit: "ml", allergens: ["soy"] },
      { name: "sesame oil", amount: 1, unit: "tsp", allergens: ["sesame"] },
      { name: "fresh ginger", amount: 10, unit: "g" },
    ],
    steps: [
      "Blend half the corn with soy milk until mostly smooth.",
      "Warm the mixture with ginger and the remaining corn, keeping it below a hard boil.",
      "Add cooked noodles, finish with sesame oil, and serve while springy.",
    ],
  },
  {
    slug: "citrus-miso-salmon",
    title: "Citrus Miso Salmon",
    teaser:
      "Roasted salmon with a sharp-sweet citrus glaze and crisp cucumber.",
    kind: "film",
    access: "supporter",
    prepMinutes: 15,
    cookMinutes: 14,
    difficulty: "intermediate",
    servings: 2,
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
    ingredients: [
      {
        name: "salmon fillets",
        amount: 2,
        unit: "piece",
        aliases: ["salmon"],
        allergens: ["fish"],
      },
      { name: "white miso", amount: 1, unit: "tbsp", allergens: ["soy"] },
      { name: "orange", amount: 1, unit: "piece" },
      { name: "cucumber", amount: 1, unit: "piece" },
    ],
    steps: [
      "Heat the oven fully and line a small roasting tray.",
      "Mix miso with orange zest and juice, then brush it over the salmon.",
      "Roast until the center reaches a safe doneness and serve with sliced cucumber.",
    ],
  },
  {
    slug: "lantern-tamago-sando",
    title: "Lantern Tamago Sando",
    teaser: "A soft egg sandwich with mustard, chives, and a tidy picnic cut.",
    kind: "theme_park",
    access: "standard",
    prepMinutes: 15,
    cookMinutes: 10,
    difficulty: "beginner",
    servings: 2,
    dietaryTags: ["vegetarian", "nut_free"],
    allergens: ["egg", "gluten", "milk", "mustard"],
    moods: ["picnic", "cheerful", "quick"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 6,
    ingredients: [
      { name: "eggs", amount: 4, unit: "piece", allergens: ["egg"] },
      {
        name: "milk bread",
        amount: 4,
        unit: "piece",
        allergens: ["gluten", "milk"],
      },
      {
        name: "mayonnaise",
        amount: 2,
        unit: "tbsp",
        allergens: ["egg", "mustard"],
      },
      { name: "chives", amount: 1, unit: "tbsp" },
    ],
    steps: [
      "Cook the eggs until set, chill them promptly, then peel.",
      "Mash with mayonnaise and chives, leaving a little texture.",
      "Fill the bread evenly, trim only if desired, and cut with a clean knife.",
    ],
  },
  {
    slug: "black-sesame-moon-pudding",
    title: "Black Sesame Moon Pudding",
    teaser: "A silken, gently sweet pudding with deep toasted-sesame flavor.",
    kind: "game",
    access: "supporter",
    prepMinutes: 10,
    cookMinutes: 12,
    difficulty: "intermediate",
    servings: 4,
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
    ingredients: [
      {
        name: "black sesame seeds",
        amount: 60,
        unit: "g",
        allergens: ["sesame"],
      },
      { name: "oat milk", amount: 500, unit: "ml" },
      { name: "cornstarch", amount: 35, unit: "g", aliases: ["corn flour"] },
      { name: "sugar", amount: 55, unit: "g", pantry: true },
    ],
    steps: [
      "Blend toasted sesame with half the oat milk until very smooth.",
      "Whisk in the remaining milk, cornstarch, and sugar before heating.",
      "Cook while stirring until thick, portion into cups, then chill completely.",
    ],
  },
  {
    slug: "matcha-pear-parfait",
    title: "Matcha Pear Parfait",
    teaser: "Layered pear, matcha yogurt, and oat crunch for a cool finish.",
    kind: "theme_park",
    access: "supporter",
    prepMinutes: 15,
    cookMinutes: 5,
    difficulty: "beginner",
    servings: 2,
    dietaryTags: ["vegetarian", "egg_free", "nut_free"],
    allergens: ["gluten", "milk"],
    moods: ["bright", "celebratory", "calm"],
    markets: ["IN", "NA", "EU", "OTHER"],
    wildcardSafety: 8,
    ingredients: [
      { name: "ripe pear", amount: 1, unit: "piece", aliases: ["pear"] },
      { name: "plain yogurt", amount: 300, unit: "g", allergens: ["milk"] },
      { name: "matcha", amount: 1, unit: "tsp" },
      { name: "rolled oats", amount: 50, unit: "g", allergens: ["gluten"] },
      { name: "honey", amount: 1, unit: "tbsp" },
    ],
    steps: [
      "Toast the oats in a dry pan until fragrant, then cool them fully.",
      "Whisk matcha and honey into the yogurt until no green streaks remain.",
      "Layer diced pear, matcha yogurt, and oats just before serving.",
    ],
  },
] as const;

function buildRecipe(
  definition: OriginalRecipeDefinition,
  index: number,
): RecipeDetail {
  const recipeId = `original-recipe-${String(index + 1).padStart(3, "0")}`;
  const totalMinutes = definition.prepMinutes + definition.cookMinutes;
  return {
    id: recipeId,
    versionId: `${recipeId}-v1-candidate`,
    slug: definition.slug,
    title: { default: definition.title },
    image: {
      id: `${recipeId}-placeholder`,
      src: "/images/food-editorial-pending.svg",
      alt: {
        default: `Editorial food photography pending for ${definition.title}`,
      },
      width: 1_200,
      height: 900,
      rightsStatus: "research_only",
      isPlaceholder: true,
    },
    fandom: {
      kind: definition.kind,
      franchiseId: `research-collection-${definition.kind}`,
      franchiseName: { default: "Occurrence verification pending" },
      appearanceCount: 0,
    },
    times: {
      prepMinutes: definition.prepMinutes,
      cookMinutes: definition.cookMinutes,
      totalMinutes,
    },
    difficulty: definition.difficulty,
    dietaryTags: definition.dietaryTags,
    allergens: definition.allergens,
    teaser: { default: definition.teaser },
    access: definition.access,
    editorialState: "candidate",
    yield: {
      servings: definition.servings,
      label: { default: `${definition.servings} servings` },
    },
    ingredients: definition.ingredients.map((ingredient, ingredientIndex) => ({
      id: `${recipeId}-ingredient-${ingredientIndex + 1}`,
      ingredientId: `ingredient-${ingredient.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: { default: ingredient.name },
      aliases: ingredient.aliases ?? [],
      quantity: { amount: ingredient.amount, unit: ingredient.unit },
      optional: ingredient.optional ?? false,
      pantryStaple: ingredient.pantry ?? false,
      allergens: ingredient.allergens ?? [],
    })),
    steps: definition.steps.map((instruction, stepIndex) => ({
      id: `${recipeId}-step-${stepIndex + 1}`,
      order: stepIndex + 1,
      instruction: { default: instruction },
      ingredientIds: [],
      equipmentIds: [],
    })),
    equipment: [
      {
        id: `${recipeId}-equipment-pan`,
        name: { default: "Cookware suitable for the method" },
        optional: false,
      },
    ],
    substitutions: [],
    provenance: {
      culinarySourceIds: [],
      appearanceEvidenceIds: [],
      authoredBy: "Anime FooDex original editorial fixture",
    },
  };
}

/**
 * Original, independently worded demonstration recipes. They remain candidates:
 * none is represented as kitchen-reviewed, rights-cleared, or evidence-verified.
 */
export const representativeRecipes: readonly RecipeDetail[] =
  DEFINITIONS.map(buildRecipe);

export const representativeRecommendationRecipes: readonly RecommendationRecipe[] =
  DEFINITIONS.map((definition, index) => ({
    id: `original-recipe-${String(index + 1).padStart(3, "0")}`,
    title: definition.title,
    ingredientNames: definition.ingredients
      .filter((ingredient) => !ingredient.pantry)
      .map((ingredient) => ingredient.name),
    ingredientAliases: definition.ingredients.flatMap(
      (ingredient) => ingredient.aliases ?? [],
    ),
    pantryStaples: definition.ingredients
      .filter((ingredient) => ingredient.pantry)
      .map((ingredient) => ingredient.name),
    moods: definition.moods,
    totalMinutes: definition.prepMinutes + definition.cookMinutes,
    difficulty: definition.difficulty,
    dietaryTags: definition.dietaryTags,
    allergens: definition.allergens,
    markets: definition.markets,
    wildcardSafety: definition.wildcardSafety,
  }));
