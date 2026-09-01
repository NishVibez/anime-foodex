import { describe, expect, it } from "vitest";

import { catalogResearchFixture } from "../../src/data";
import { FANDOM_KINDS, validateCatalogForRelease } from "../../src/domain";

describe("GA catalog gate", () => {
  it("builds the deterministic minimum structural quota fixture", () => {
    const report = validateCatalogForRelease(catalogResearchFixture, {
      mode: "fixture",
    });
    expect(report.valid).toBe(true);
    expect(report.gaReady).toBe(false);
    expect(report.recipeCount).toBe(420);
    expect(report.appearanceCount).toBe(1_000);
    expect(report.standardCount).toBe(200);
    expect(report.supporterCount).toBe(220);
    for (const kind of FANDOM_KINDS) {
      expect(report.recipesByKind[kind]).toBe(84);
      expect(report.appearancesByKind[kind]).toBe(200);
    }
  });

  it("does not falsely pass candidates as launch-ready content", () => {
    const report = validateCatalogForRelease(catalogResearchFixture);
    expect(report.valid).toBe(false);
    expect(report.gaReady).toBe(false);
    expect(
      report.issues.some((issue) => issue.code === "recipe_not_publishable"),
    ).toBe(true);
    expect(
      report.issues.some((issue) => issue.code === "appearance_not_verified"),
    ).toBe(true);
  });

  it("allows the catalog to grow beyond the launch minimum", () => {
    const supporter = catalogResearchFixture.recipes.find(
      (recipe) => recipe.access === "supporter",
    );
    expect(supporter).toBeDefined();

    const report = validateCatalogForRelease(
      {
        recipes: [
          ...catalogResearchFixture.recipes,
          {
            ...supporter!,
            id: "recipe-candidate-over-minimum",
            slug: "recipe-candidate-over-minimum",
            primaryKind: "anime" as const,
          },
        ],
        appearances: catalogResearchFixture.appearances,
      },
      { mode: "fixture" },
    );

    expect(report.valid).toBe(true);
    expect(report.recipeCount).toBe(421);
    expect(report.recipesByKind.anime).toBe(85);
  });

  it("detects quota drift", () => {
    const report = validateCatalogForRelease(
      {
        recipes: catalogResearchFixture.recipes.slice(1),
        appearances: catalogResearchFixture.appearances,
      },
      { mode: "fixture" },
    );
    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === "recipe_total")).toBe(
      true,
    );
  });
});
