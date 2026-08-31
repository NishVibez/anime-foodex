/**
 * Portable product contracts for Anime FooDex.
 *
 * Keep this module free of browser, React, Next.js, and database dependencies so
 * the same values can be validated on the server, in tests, and in the PWA.
 */

export const FANDOM_KINDS = [
  "anime",
  "animation",
  "game",
  "film",
  "theme_park",
] as const;
export type FandomKind = (typeof FANDOM_KINDS)[number];

export const APPEARANCE_TYPES = [
  "shown",
  "mentioned",
  "official_inspired",
  "game_item",
  "menu_item",
  "adjacent_media",
] as const;
export type AppearanceType = (typeof APPEARANCE_TYPES)[number];

export const RIGHTS_STATUSES = [
  "research_only",
  "rights_unknown",
  "licensed",
  "creator_permission",
  "public_domain",
  "original_editorial",
] as const;
export type RightsStatus = (typeof RIGHTS_STATUSES)[number];

export const EDITORIAL_STATES = [
  "candidate",
  "evidence_verified",
  "drafted",
  "test_cooked",
  "culinary_reviewed",
  "rights_cleared",
  "published",
  "retired",
] as const;
export type EditorialState = (typeof EDITORIAL_STATES)[number];

export const ACCESS_TIERS = ["guest", "member", "supporter"] as const;
export type AccessTier = (typeof ACCESS_TIERS)[number];

export const RECIPE_ACCESS_LEVELS = ["standard", "supporter"] as const;
export type RecipeAccessLevel = (typeof RECIPE_ACCESS_LEVELS)[number];

export const PAYMENT_GATEWAYS = ["razorpay", "stripe"] as const;
export type PaymentGateway = (typeof PAYMENT_GATEWAYS)[number];

export const AD_PROVIDERS = ["adsense", "media_net", "infolinks"] as const;
export type AdProvider = (typeof AD_PROVIDERS)[number];

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIETARY_TAGS = [
  "vegan",
  "vegetarian",
  "pescatarian",
  "halal_friendly",
  "gluten_free",
  "dairy_free",
  "egg_free",
  "nut_free",
] as const;
export type DietaryTag = (typeof DIETARY_TAGS)[number];

export const ALLERGENS = [
  "celery",
  "crustacean",
  "egg",
  "fish",
  "gluten",
  "lupin",
  "milk",
  "mollusc",
  "mustard",
  "peanut",
  "sesame",
  "soy",
  "sulphite",
  "tree_nut",
] as const;
export type Allergen = (typeof ALLERGENS)[number];

export const MARKET_CODES = ["IN", "NA", "EU", "OTHER"] as const;
export type MarketCode = (typeof MARKET_CODES)[number];

export const UNIT_SYSTEMS = ["metric", "imperial"] as const;
export type UnitSystem = (typeof UNIT_SYSTEMS)[number];

export type LocaleCode = string;
export type EntityId = string;

export interface LocalizedText {
  readonly default: string;
  readonly translations?: Readonly<Record<LocaleCode, string>>;
}

export interface MediaAssetSummary {
  readonly id: EntityId;
  readonly src: string;
  readonly alt: LocalizedText;
  readonly width: number;
  readonly height: number;
  readonly rightsStatus: RightsStatus;
  readonly isPlaceholder?: boolean;
}

export interface FandomContext {
  readonly kind: FandomKind;
  readonly franchiseId: EntityId;
  readonly franchiseName: LocalizedText;
  readonly workId?: EntityId;
  readonly workName?: LocalizedText;
  readonly appearanceCount: number;
}

export interface RecipeTimes {
  readonly prepMinutes: number;
  readonly cookMinutes: number;
  readonly totalMinutes: number;
}

export interface RecipePreview {
  readonly id: EntityId;
  readonly versionId: EntityId;
  readonly slug: string;
  readonly title: LocalizedText;
  readonly image: MediaAssetSummary | null;
  readonly fandom: FandomContext;
  readonly times: RecipeTimes;
  readonly difficulty: Difficulty;
  readonly dietaryTags: readonly DietaryTag[];
  readonly allergens: readonly Allergen[];
  readonly teaser: LocalizedText;
  readonly access: RecipeAccessLevel;
  readonly editorialState: EditorialState;
}

export const QUANTITY_UNITS = [
  "mg",
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "fl_oz",
  "oz",
  "lb",
  "celsius",
  "fahrenheit",
  "piece",
  "pinch",
] as const;
export type QuantityUnit = (typeof QUANTITY_UNITS)[number];

export interface StructuredQuantity {
  readonly amount: number;
  readonly unit: QuantityUnit;
  readonly maximumAmount?: number;
  readonly displayNote?: LocalizedText;
}

export interface RecipeIngredient {
  readonly id: EntityId;
  readonly ingredientId: EntityId;
  readonly name: LocalizedText;
  readonly aliases: readonly string[];
  readonly quantity: StructuredQuantity;
  readonly preparation?: LocalizedText;
  readonly optional: boolean;
  readonly pantryStaple: boolean;
  readonly allergens: readonly Allergen[];
}

export interface RecipeStep {
  readonly id: EntityId;
  readonly order: number;
  readonly instruction: LocalizedText;
  readonly timerSeconds?: number;
  readonly safetyNote?: LocalizedText;
  readonly ingredientIds: readonly EntityId[];
  readonly equipmentIds: readonly EntityId[];
}

export interface EquipmentItem {
  readonly id: EntityId;
  readonly name: LocalizedText;
  readonly optional: boolean;
}

export interface RecipeProvenance {
  readonly culinarySourceIds: readonly EntityId[];
  readonly appearanceEvidenceIds: readonly EntityId[];
  readonly authoredBy: string;
  readonly testedAt?: string;
  readonly rightsReviewedAt?: string;
}

export interface RecipeDetail extends RecipePreview {
  readonly yield: {
    readonly servings: number;
    readonly label: LocalizedText;
  };
  readonly ingredients: readonly RecipeIngredient[];
  readonly steps: readonly RecipeStep[];
  readonly equipment: readonly EquipmentItem[];
  readonly substitutions: readonly RegionalSubstitution[];
  readonly provenance: RecipeProvenance;
}

export interface RegionalSubstitution {
  readonly id: EntityId;
  readonly ingredientId: EntityId;
  readonly substituteIngredientId: EntityId;
  readonly substituteName: LocalizedText;
  readonly markets: readonly MarketCode[];
  readonly priority: number;
  readonly ratio: number;
  readonly reason: LocalizedText;
  readonly allergens: readonly Allergen[];
  readonly dietaryTags: readonly DietaryTag[];
}

export interface AppearanceEvidence {
  readonly id: EntityId;
  readonly dishId: EntityId;
  readonly recipeId?: EntityId;
  readonly primaryKind: FandomKind;
  readonly appearanceType: AppearanceType;
  readonly workId: EntityId;
  readonly sourceId: EntityId;
  readonly locator: string | null;
  readonly verificationStatus: "candidate" | "verified" | "rejected";
  readonly verifiedAt?: string;
  readonly verifiedBy?: string;
  readonly researchNote?: string;
}

export interface EditorialChecks {
  readonly independentlyAuthored: boolean;
  readonly kitchenTested: boolean;
  readonly ingredientReviewed: boolean;
  readonly allergenReviewed: boolean;
  readonly mediaRightsCleared: boolean;
  readonly occurrenceEvidenceVerified: boolean;
  readonly culinaryApproved: boolean;
  readonly rightsApproved: boolean;
}

export interface CatalogRecipeRecord {
  readonly id: EntityId;
  readonly slug: string;
  readonly title: LocalizedText;
  readonly primaryKind: FandomKind;
  readonly access: RecipeAccessLevel;
  readonly editorialState: EditorialState;
  readonly rightsStatus: RightsStatus;
  readonly checks: EditorialChecks;
  readonly sourceLocatorCount: number;
}

export interface CatalogSnapshot {
  readonly recipes: readonly CatalogRecipeRecord[];
  readonly appearances: readonly AppearanceEvidence[];
}

export interface RecommendationRequest {
  readonly availableIngredients: readonly string[];
  readonly mood: readonly string[];
  readonly maximumTotalMinutes: number;
  readonly skill: Difficulty;
  readonly dietaryRequirements: readonly DietaryTag[];
  readonly allergens: readonly Allergen[];
  readonly dislikedIngredients: readonly string[];
  readonly market: MarketCode;
  readonly unitSystem: UnitSystem;
}

export interface RecommendationRecipe {
  readonly id: EntityId;
  readonly title: string;
  readonly ingredientNames: readonly string[];
  readonly ingredientAliases?: readonly string[];
  readonly pantryStaples?: readonly string[];
  readonly moods: readonly string[];
  readonly totalMinutes: number;
  readonly difficulty: Difficulty;
  readonly dietaryTags: readonly DietaryTag[];
  readonly allergens: readonly Allergen[];
  readonly markets: readonly MarketCode[];
  readonly wildcardSafety: number;
}

export interface RecommendationChoice {
  readonly recipeId: EntityId;
  readonly title: string;
  readonly score: number;
  readonly matchedIngredients: readonly string[];
  readonly missingIngredients: readonly string[];
  readonly reasons: readonly string[];
}

export interface RecommendationResult {
  readonly choices: readonly RecommendationChoice[];
  readonly wildcard: RecommendationChoice | null;
  readonly excludedCount: number;
  readonly evaluatedCount: number;
  readonly algorithmVersion: string;
}

export interface Entitlement {
  readonly id: EntityId;
  readonly userId: EntityId;
  readonly gateway: PaymentGateway;
  readonly externalCustomerId: string;
  readonly externalPurchaseId: string;
  readonly plan: "monthly" | "yearly" | "lifetime";
  readonly status:
    | "pending"
    | "active"
    | "past_due"
    | "cancelled"
    | "expired"
    | "refunded"
    | "disputed"
    | "revoked";
  readonly effectiveFrom: string;
  readonly effectiveUntil: string | null;
  readonly lifetime: boolean;
  readonly sourceWebhookId: string;
}
