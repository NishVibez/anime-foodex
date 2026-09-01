import { describe, expect, it } from "vitest";

import { emailCredentialsSchema } from "@/domain/auth";

describe("email authentication inputs", () => {
  it("normalizes a valid email while preserving the password", () => {
    expect(
      emailCredentialsSchema.parse({
        email: "  COOK@EXAMPLE.COM ",
        password: "correct-horse-battery-staple",
      }),
    ).toEqual({
      email: "cook@example.com",
      password: "correct-horse-battery-staple",
    });
  });

  it("rejects malformed emails and short passwords", () => {
    expect(
      emailCredentialsSchema.safeParse({
        email: "not-an-email",
        password: "short",
      }).success,
    ).toBe(false);
  });
});
