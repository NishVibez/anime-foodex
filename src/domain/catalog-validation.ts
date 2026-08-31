import {
  FANDOM_KINDS,
  type CatalogRecipeRecord,
  type CatalogSnapshot,
  type FandomKind,
} from "./contracts";

export const GA_CATALOG_RULES = {
  exactRecipes: 420,
  minimumAppearances: 1_000,
  exactRecipesPerKind: 84,
  minimumAppearancesPerKind: 200,
  maximumStandardRecipes: 200,
  minimumSupporterRecipes: 220,
} as const;

export interface CatalogValidationOptions {
  /** Fixture mode checks shape/quota distribution without pretending review happened. */
  readonly mode?: "ga" | "fixture";
}

export interface CatalogValidationIssue {
  readonly code: string;
  readonly message: string;
}

export interface CatalogValidationReport {
  readonly valid: boolean;
  readonly gaReady: boolean;
  readonly recipeCount: number;
  readonly appearanceCount: number;
  readonly standardCount: number;
  readonly supporterCount: number;
  readonly recipesByKind: Readonly<Record<FandomKind, number>>;
  readonly appearancesByKind: Readonly<Record<FandomKind, number>>;
  readonly issues: readonly CatalogValidationIssue[];
}

function allPublicationChecksPass(recipe: CatalogRecipeRecord): boolean {
  return Object.values(recipe.checks).every(Boolean);
}

function zeroCounts(): Record<FandomKind, number> {
  return Object.fromEntries(FANDOM_KINDS.map((kind) => [kind, 0])) as Record<
    FandomKind,
    number
  >;
}

export function validateCatalogForRelease(
  snapshot: CatalogSnapshot,
  options: CatalogValidationOptions = {},
): CatalogValidationReport {
  const mode = options.mode ?? "ga";
  const issues: CatalogValidationIssue[] = [];
  const recipesByKind = zeroCounts();
  const appearancesByKind = zeroCounts();
  const recipeIds = new Set<string>();
  const appearanceIds = new Set<string>();
  const slugs = new Set<string>();
  let standardCount = 0;
  let supporterCount = 0;

  for (const recipe of snapshot.recipes) {
    recipesByKind[recipe.primaryKind] += 1;
    if (recipe.access === "standard") {
      standardCount += 1;
    } else {
      supporterCount += 1;
    }
    if (recipeIds.has(recipe.id)) {
      issues.push({
        code: "duplicate_recipe_id",
        message: `Duplicate recipe id: ${recipe.id}`,
      });
    }
    if (slugs.has(recipe.slug)) {
      issues.push({
        code: "duplicate_recipe_slug",
        message: `Duplicate recipe slug: ${recipe.slug}`,
      });
    }
    recipeIds.add(recipe.id);
    slugs.add(recipe.slug);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recipe.slug)) {
      issues.push({
        code: "invalid_recipe_slug",
        message: `${recipe.slug} is not a canonical lowercase slug.`,
      });
    }

    if (
      mode === "ga" &&
      (recipe.editorialState !== "published" ||
        recipe.rightsStatus === "research_only" ||
        recipe.rightsStatus === "rights_unknown" ||
        !allPublicationChecksPass(recipe) ||
        recipe.sourceLocatorCount < 1)
    ) {
      issues.push({
        code: "recipe_not_publishable",
        message: `${recipe.id} has not completed every publication gate.`,
      });
    }
  }

  for (const appearance of snapshot.appearances) {
    appearancesByKind[appearance.primaryKind] += 1;
    if (appearanceIds.has(appearance.id)) {
      issues.push({
        code: "duplicate_appearance_id",
        message: `Duplicate appearance id: ${appearance.id}`,
      });
    }
    appearanceIds.add(appearance.id);
    if (appearance.recipeId && !recipeIds.has(appearance.recipeId)) {
      issues.push({
        code: "missing_recipe_reference",
        message: `${appearance.id} refers to unknown recipe ${appearance.recipeId}.`,
      });
    }
    if (
      mode === "ga" &&
      (appearance.verificationStatus !== "verified" ||
        !appearance.locator?.trim() ||
        !appearance.verifiedAt ||
        !appearance.verifiedBy)
    ) {
      issues.push({
        code: "appearance_not_verified",
        message: `${appearance.id} is not independently verified.`,
      });
    }
  }

  if (snapshot.recipes.length !== GA_CATALOG_RULES.exactRecipes) {
    issues.push({
      code: "recipe_total",
      message: `Expected exactly ${GA_CATALOG_RULES.exactRecipes} recipes; found ${snapshot.recipes.length}.`,
    });
  }
  if (snapshot.appearances.length < GA_CATALOG_RULES.minimumAppearances) {
    issues.push({
      code: "appearance_total",
      message: `Expected at least ${GA_CATALOG_RULES.minimumAppearances} appearances; found ${snapshot.appearances.length}.`,
    });
  }
  if (standardCount > GA_CATALOG_RULES.maximumStandardRecipes) {
    issues.push({
      code: "standard_total",
      message: `Standard recipes exceed ${GA_CATALOG_RULES.maximumStandardRecipes}.`,
    });
  }
  if (supporterCount < GA_CATALOG_RULES.minimumSupporterRecipes) {
    issues.push({
      code: "supporter_total",
      message: `Supporter recipes are below ${GA_CATALOG_RULES.minimumSupporterRecipes}.`,
    });
  }
  for (const kind of FANDOM_KINDS) {
    if (recipesByKind[kind] !== GA_CATALOG_RULES.exactRecipesPerKind) {
      issues.push({
        code: `recipe_quota_${kind}`,
        message: `${kind} must have exactly ${GA_CATALOG_RULES.exactRecipesPerKind} recipes.`,
      });
    }
    if (appearancesByKind[kind] < GA_CATALOG_RULES.minimumAppearancesPerKind) {
      issues.push({
        code: `appearance_quota_${kind}`,
        message: `${kind} must have at least ${GA_CATALOG_RULES.minimumAppearancesPerKind} appearances.`,
      });
    }
  }

  const gaBlockingCodes = new Set([
    "recipe_not_publishable",
    "appearance_not_verified",
  ]);
  const structuralIssues = issues.filter(
    (issue) => !gaBlockingCodes.has(issue.code),
  );
  return {
    valid:
      mode === "fixture" ? structuralIssues.length === 0 : issues.length === 0,
    gaReady: issues.length === 0 && mode === "ga",
    recipeCount: snapshot.recipes.length,
    appearanceCount: snapshot.appearances.length,
    standardCount,
    supporterCount,
    recipesByKind,
    appearancesByKind,
    issues,
  };
}
