import { describe, expect, it } from "vitest";

import type { RecipeIngredient, RegionalSubstitution } from "../../src/domain";
import {
  chooseRegionalSubstitution,
  convertQuantity,
  scaleIngredients,
} from "../../src/domain";

describe("measurement and scaling", () => {
  it("converts mass, volume, temperature, and density deterministically", () => {
    expect(convertQuantity(1, "cup", "ml")).toBe(236.59);
    expect(convertQuantity(1, "lb", "g")).toBe(453.59);
    expect(convertQuantity(180, "celsius", "fahrenheit")).toBe(356);
    expect(convertQuantity(100, "g", "ml", 0.8)).toBe(125);
    expect(() => convertQuantity(100, "g", "ml")).toThrow(/density/);
  });

  it("scales servings and converts to the requested unit system", () => {
    const ingredients: RecipeIngredient[] = [
      {
        id: "ri-1",
        ingredientId: "rice",
        name: { default: "rice" },
        aliases: [],
        quantity: { amount: 500, unit: "g" },
        optional: false,
        pantryStaple: false,
        allergens: [],
      },
    ];
    const scaled = scaleIngredients(ingredients, 2, 4, "imperial");
    expect(scaled[0]?.quantity.unit).toBe("lb");
    expect(scaled[0]?.quantity.amount).toBeCloseTo(2.2, 2);
  });
});

describe("regional substitutions", () => {
  const substitutions: RegionalSubstitution[] = [
    {
      id: "safe-high",
      ingredientId: "mirin",
      substituteIngredientId: "rice-syrup",
      substituteName: { default: "rice syrup and vinegar" },
      markets: ["IN"],
      priority: 20,
      ratio: 1,
      reason: { default: "Accessible alternative" },
      allergens: [],
      dietaryTags: ["vegan", "gluten_free"],
    },
    {
      id: "unsafe",
      ingredientId: "mirin",
      substituteIngredientId: "soy-glaze",
      substituteName: { default: "soy glaze" },
      markets: ["IN"],
      priority: 50,
      ratio: 1,
      reason: { default: "Contains soy" },
      allergens: ["soy"],
      dietaryTags: ["vegan", "gluten_free"],
    },
  ];

  it("chooses the highest-priority regionally valid allergen-safe option", () => {
    const selected = chooseRegionalSubstitution("mirin", substitutions, {
      market: "IN",
      allergens: ["soy"],
      dietaryRequirements: ["vegan"],
    });
    expect(selected?.id).toBe("safe-high");
  });
});
