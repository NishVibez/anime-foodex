import { describe, expect, it } from "vitest";

import { safeRelativePath } from "@/lib/http/safe-path";

describe("safeRelativePath", () => {
  it("keeps local paths and query strings", () => {
    expect(safeRelativePath("/recipes/moonlit?unit=metric")).toBe(
      "/recipes/moonlit?unit=metric",
    );
  });

  it.each([
    "https://evil.example/path",
    "//evil.example/path",
    "/\\evil.example/path",
    "\\evil.example/path",
    "javascript:alert(1)",
  ])("rejects redirect candidate %s", (candidate) => {
    expect(safeRelativePath(candidate)).toBe("/vault");
  });
});
