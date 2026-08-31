import { describe, expect, it } from "vitest";

import {
  calculateXpAward,
  eventCooldownSatisfied,
  leaderboardScore,
  levelForTotalXp,
  SUPPORTER_COMPETITIVE_XP_BONUS_PERCENT,
} from "../../src/domain";

describe("server-authoritative game rules", () => {
  it("requires idempotency keys", () => {
    expect(() =>
      calculateXpAward({
        eventType: "cook_completed",
        accessTier: "member",
        idempotencyKey: "",
        occurredAt: "2026-08-30T10:00:00.000Z",
      }),
    ).toThrow(/idempotency/);
  });

  it("applies the configured Supporter competitive XP advantage", () => {
    const member = calculateXpAward({
      eventType: "cook_completed",
      accessTier: "member",
      idempotencyKey: "member-cook-1",
      occurredAt: "2026-08-30T10:00:00.000Z",
    });
    const supporter = calculateXpAward({
      eventType: "cook_completed",
      accessTier: "supporter",
      idempotencyKey: "supporter-cook-1",
      occurredAt: "2026-08-30T10:00:00.000Z",
    });
    expect(SUPPORTER_COMPETITIVE_XP_BONUS_PERCENT).toBe(10);
    expect(supporter.totalXp).toBeGreaterThan(member.totalXp);
    expect(leaderboardScore([supporter])).toBe(supporter.totalXp);
  });

  it("enforces rule cooldowns and calculates levels", () => {
    expect(
      eventCooldownSatisfied(
        "cook_completed",
        "2026-08-30T10:00:00.000Z",
        "2026-08-30T10:00:59.000Z",
      ),
    ).toBe(false);
    expect(
      eventCooldownSatisfied(
        "cook_completed",
        "2026-08-30T10:00:00.000Z",
        "2026-08-30T10:01:00.000Z",
      ),
    ).toBe(true);
    expect(levelForTotalXp(0)).toBe(1);
    expect(levelForTotalXp(100)).toBe(2);
  });
});
