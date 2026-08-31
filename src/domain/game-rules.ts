import type { AccessTier } from "./contracts";

export const GAME_RULE_VERSION = "2026-08-30.1";
export const SUPPORTER_COMPETITIVE_XP_BONUS_PERCENT = 10;

export const XP_EVENTS = [
  "first_cook",
  "cook_completed",
  "cook_photo_approved",
  "helpful_review",
  "daily_quest",
  "weekly_quest",
  "streak_milestone",
] as const;
export type XpEventType = (typeof XP_EVENTS)[number];

export interface XpRule {
  readonly eventType: XpEventType;
  readonly baseXp: number;
  readonly competitive: boolean;
  readonly cooldownSeconds: number;
}

export const XP_RULES: Readonly<Record<XpEventType, XpRule>> = {
  first_cook: {
    eventType: "first_cook",
    baseXp: 50,
    competitive: true,
    cooldownSeconds: 0,
  },
  cook_completed: {
    eventType: "cook_completed",
    baseXp: 100,
    competitive: true,
    cooldownSeconds: 60,
  },
  cook_photo_approved: {
    eventType: "cook_photo_approved",
    baseXp: 30,
    competitive: true,
    cooldownSeconds: 0,
  },
  helpful_review: {
    eventType: "helpful_review",
    baseXp: 25,
    competitive: true,
    cooldownSeconds: 300,
  },
  daily_quest: {
    eventType: "daily_quest",
    baseXp: 50,
    competitive: true,
    cooldownSeconds: 86_400,
  },
  weekly_quest: {
    eventType: "weekly_quest",
    baseXp: 200,
    competitive: true,
    cooldownSeconds: 604_800,
  },
  streak_milestone: {
    eventType: "streak_milestone",
    baseXp: 75,
    competitive: true,
    cooldownSeconds: 86_400,
  },
};

export interface XpAwardInput {
  readonly eventType: XpEventType;
  readonly accessTier: AccessTier;
  readonly idempotencyKey: string;
  readonly occurredAt: string;
}

export interface XpAward {
  readonly eventType: XpEventType;
  readonly baseXp: number;
  readonly bonusXp: number;
  readonly totalXp: number;
  readonly idempotencyKey: string;
  readonly occurredAt: string;
  readonly ruleVersion: string;
}

export function calculateXpAward(input: XpAwardInput): XpAward {
  if (!input.idempotencyKey.trim()) {
    throw new RangeError("An idempotency key is required for every XP event.");
  }
  if (!Number.isFinite(Date.parse(input.occurredAt))) {
    throw new RangeError("XP event time is invalid.");
  }
  const rule = XP_RULES[input.eventType];
  const bonusXp =
    input.accessTier === "supporter" && rule.competitive
      ? Math.round((rule.baseXp * SUPPORTER_COMPETITIVE_XP_BONUS_PERCENT) / 100)
      : 0;
  return {
    eventType: input.eventType,
    baseXp: rule.baseXp,
    bonusXp,
    totalXp: rule.baseXp + bonusXp,
    idempotencyKey: input.idempotencyKey,
    occurredAt: input.occurredAt,
    ruleVersion: GAME_RULE_VERSION,
  };
}

export function eventCooldownSatisfied(
  eventType: XpEventType,
  previousAwardAt: string | null,
  nextAwardAt: string,
): boolean {
  if (!previousAwardAt) return true;
  const previous = Date.parse(previousAwardAt);
  const next = Date.parse(nextAwardAt);
  if (!Number.isFinite(previous) || !Number.isFinite(next)) {
    throw new RangeError("Cooldown timestamps must be valid.");
  }
  return next - previous >= XP_RULES[eventType].cooldownSeconds * 1_000;
}

/** Level 1 starts at zero; each level costs progressively more XP. */
export function totalXpRequiredForLevel(level: number): number {
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError("Level must be a positive integer.");
  }
  return level === 1 ? 0 : Math.floor(100 * (level - 1) ** 1.5);
}

export function levelForTotalXp(totalXp: number): number {
  if (!Number.isFinite(totalXp) || totalXp < 0) {
    throw new RangeError("Total XP cannot be negative.");
  }
  let level = 1;
  while (totalXpRequiredForLevel(level + 1) <= totalXp) level += 1;
  return level;
}

export function leaderboardScore(awards: readonly XpAward[]): number {
  return awards.reduce((sum, award) => sum + award.totalXp, 0);
}
