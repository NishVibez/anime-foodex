import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type ReferenceManifest = {
  policy: {
    scope: string;
    excludedFields: string[];
    publicationRequiresIndependentEditorialPipeline: boolean;
  };
  summary: {
    sourceCount: number;
    occurrenceCount: number;
    uniqueNormalizedTitleCount: number;
    occurrencesBySource: Record<string, number>;
  };
  sources: Array<{
    key: string;
    fileName: string;
    sha256: string;
    rightsStatus: string;
  }>;
  occurrences: Array<Record<string, unknown>>;
};

const manifest = JSON.parse(
  fs.readFileSync(
    path.join(
      process.cwd(),
      "content",
      "research",
      "reference-cookbook-candidates.json",
    ),
    "utf8",
  ),
) as ReferenceManifest;

const expectedSourceCounts = {
  "anime-chef-cookbook": 75,
  "avatar-official-cookbook": 62,
  "bake-anime": 75,
  "black-butler-cookbook": 26,
  "dr-stone-unofficial-cookbook": 45,
  "ffxv-community-cookbook": 65,
  "food-wars-recipe-compilation": 60,
  "lets-make-ramen": 51,
  "mila-brady-studio-ghibli-cookbook": 35,
  "naruto-anime-recipes": 30,
  "official-disney-parks-cookbook": 101,
  "one-piece-pirate-recipes": 44,
  "stardew-valley-cookbook": 93,
  "studio-ghibli-recipe-book": 9,
  "unofficial-studio-ghibli-cookbook": 46,
};

const suppliedFiles = [
  "Black Butler Cookbook.pdf",
  "BakeAnime_EmilyJBushman.pdf",
  "1005436242-Dr-stone-Unofficial-Cookbook-Completo-1.pdf",
  "982747757-The-Unofficial-Studio-Ghibli-Cookbook-PDF.pdf",
  "869850350-Studio-Ghibli-Cookbook-Provides-You-With-Unique-Cooking-Mila-Brady-United-States-2021.pdf",
  "866351829-Avatar-the-Last-Airbender-Cookbook-Official-Recipes-From-the-Four-Nations-Jenny-Dorsey-1.pdf",
  "813175920-Let-s-Make-Ramen-A-Comic-Book-Cookbook.pdf",
  "773500793-An-i-Me-Chef-Cookbook.pdf",
  "749742785-The-Official-Disney-Parks-Cookbook-Pam-Brandon.pdf",
  "707247589-Stardew-Valley-Cookbook.pdf",
  "694420737-Studio-Ghibli-Recipe-Book.pdf",
  "676869206-One-Piece-Pirate-Recipes-Sanji-2021.pdf",
  "491755417-Naruto-Anime-Recipes-You-Should-Be-Making-Susan-Gray.pdf",
  "467004013-Food-Wars-Shokugeki-No-Souma-Recipe-pdf.pdf",
  "352910550-FFXV-Recipe-Cookbook.pdf",
];

describe("reference cookbook candidate manifest", () => {
  it("retains every supplied source and discovered occurrence", () => {
    expect(manifest.summary).toMatchObject({
      sourceCount: 15,
      occurrenceCount: 817,
      uniqueNormalizedTitleCount: 807,
      occurrencesBySource: expectedSourceCounts,
    });
    expect(manifest.sources.map((source) => source.fileName).sort()).toEqual(
      suppliedFiles.sort(),
    );
    expect(manifest.occurrences).toHaveLength(817);
  });

  it("keeps all source discoveries private and research-only", () => {
    expect(manifest.policy).toMatchObject({
      scope: "research_discovery_only",
      publicationRequiresIndependentEditorialPipeline: true,
    });
    expect(manifest.policy.excludedFields).toEqual(
      expect.arrayContaining([
        "ingredients",
        "quantities",
        "instructions",
        "expressive prose",
        "source media",
      ]),
    );
    expect(
      manifest.sources.every(
        (source) => source.rightsStatus === "research_only",
      ),
    ).toBe(true);
    expect(
      manifest.occurrences.every(
        (candidate) =>
          candidate.rightsStatus === "research_only" &&
          candidate.editorialState === "candidate",
      ),
    ).toBe(true);
  });

  it("does not contain protected recipe content or duplicate occurrence IDs", () => {
    const forbiddenKeys = new Set([
      "ingredient",
      "ingredients",
      "quantity",
      "quantities",
      "instruction",
      "instructions",
      "step",
      "steps",
      "description",
      "image",
      "media",
    ]);
    const ids = manifest.occurrences.map((candidate) => candidate.id);

    for (const candidate of manifest.occurrences) {
      expect(Object.keys(candidate).some((key) => forbiddenKeys.has(key))).toBe(
        false,
      );
    }
    expect(new Set(ids).size).toBe(ids.length);
  });
});
