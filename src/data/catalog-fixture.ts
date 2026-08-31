import {
  FANDOM_KINDS,
  type AppearanceEvidence,
  type CatalogRecipeRecord,
  type CatalogSnapshot,
  type FandomKind,
} from "../domain/contracts";

const DISH_FAMILIES = [
  "Rice Bowl",
  "Noodle Soup",
  "Filled Bun",
  "Garden Curry",
  "Picnic Sandwich",
  "Fruit Parfait",
  "Pan Stew",
  "Tea Cake",
  "Grilled Skewer",
  "Savory Pancake",
  "Baked Dumpling",
  "Festival Pudding",
] as const;

const COLLECTION_LABELS: Readonly<Record<FandomKind, string>> = {
  anime: "Anime",
  animation: "Other Animation",
  game: "Game",
  film: "Film",
  theme_park: "Themed Park and World",
};

const NO_EDITORIAL_CHECKS = {
  independentlyAuthored: false,
  kitchenTested: false,
  ingredientReviewed: false,
  allergenReviewed: false,
  mediaRightsCleared: false,
  occurrenceEvidenceVerified: false,
  culinaryApproved: false,
  rightsApproved: false,
} as const;

function pad(value: number, size = 3): string {
  return String(value).padStart(size, "0");
}

function slugify(value: string): string {
  return value
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createRecipes(): CatalogRecipeRecord[] {
  const recipes: CatalogRecipeRecord[] = [];
  let globalIndex = 0;
  for (const kind of FANDOM_KINDS) {
    for (let kindIndex = 0; kindIndex < 84; kindIndex += 1) {
      const ordinal = globalIndex + 1;
      const family = DISH_FAMILIES[kindIndex % DISH_FAMILIES.length]!;
      const title = `${COLLECTION_LABELS[kind]} ${family} Candidate ${pad(kindIndex + 1)}`;
      recipes.push({
        id: `catalog-candidate-${pad(ordinal)}`,
        slug: `${slugify(COLLECTION_LABELS[kind])}-${slugify(family)}-${pad(kindIndex + 1)}`,
        title: { default: title },
        primaryKind: kind,
        access: globalIndex < 200 ? "standard" : "supporter",
        editorialState: "candidate",
        rightsStatus: "research_only",
        checks: NO_EDITORIAL_CHECKS,
        sourceLocatorCount: 0,
      });
      globalIndex += 1;
    }
  }
  return recipes;
}

function createAppearances(
  recipes: readonly CatalogRecipeRecord[],
): AppearanceEvidence[] {
  const appearances: AppearanceEvidence[] = [];
  for (const kind of FANDOM_KINDS) {
    const kindRecipes = recipes.filter((recipe) => recipe.primaryKind === kind);
    for (let kindIndex = 0; kindIndex < 200; kindIndex += 1) {
      const recipe = kindRecipes[kindIndex % kindRecipes.length]!;
      appearances.push({
        id: `appearance-candidate-${kind}-${pad(kindIndex + 1)}`,
        dishId: `dish-candidate-${recipe.id}`,
        recipeId: recipe.id,
        primaryKind: kind,
        appearanceType:
          kind === "game"
            ? "game_item"
            : kind === "theme_park"
              ? "menu_item"
              : "shown",
        workId: `work-candidate-${kind}-${pad(Math.floor(kindIndex / 4) + 1)}`,
        sourceId: `source-intake-pending-${kind}`,
        locator: null,
        verificationStatus: "candidate",
        researchNote:
          "Fixture only. Replace with an independently checked private locator before editorial promotion.",
      });
    }
  }
  return appearances;
}

const recipes = createRecipes();
const appearances = createAppearances(recipes);

/**
 * A deterministic scale/CI fixture: 420 candidate recipes and 1,000 candidate
 * appearances. It proves schema and quota behavior but is intentionally not a
 * publishable catalog and must never be presented as verified content.
 */
export const catalogResearchFixture: CatalogSnapshot = {
  recipes,
  appearances,
};
