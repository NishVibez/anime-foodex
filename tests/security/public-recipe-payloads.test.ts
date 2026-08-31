import { describe, expect, it } from "vitest";

import { featuredRecipes } from "../../src/content/experience";
import {
  representativeRecipePreviews,
  representativeRecommendationRecipes,
} from "../../src/data/recommendation-previews";

const protectedKeys = new Set([
  "amount",
  "quantity",
  "instruction",
  "instructions",
  "steps",
  "substitutions",
  "equipment",
  "yield",
]);

function collectKeys(value: unknown, keys = new Set<string>()) {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, keys);
    return keys;
  }
  if (!value || typeof value !== "object") return keys;
  for (const [key, child] of Object.entries(value)) {
    keys.add(key);
    collectKeys(child, keys);
  }
  return keys;
}

describe("public recipe payload boundary", () => {
  it("keeps protected kitchen-card fields out of public catalog data", () => {
    const keys = collectKeys(featuredRecipes);
    for (const key of protectedKeys) expect(keys.has(key)).toBe(false);
  });

  it("keeps the offline recommendation dataset preview-safe", () => {
    const keys = collectKeys([
      representativeRecipePreviews,
      representativeRecommendationRecipes,
    ]);
    for (const key of protectedKeys) expect(keys.has(key)).toBe(false);
  });
});
