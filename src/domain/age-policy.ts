export const AGE_POLICY_VERSION = "2026-08-30.1";

/**
 * EU/EEA digital-consent thresholds are configuration, not legal inference.
 * Unknown EEA countries conservatively fall back to 16.
 */
export const EEA_DIGITAL_CONSENT_AGES: Readonly<Record<string, number>> = {
  AT: 14,
  BE: 13,
  BG: 14,
  HR: 16,
  CY: 14,
  CZ: 15,
  DE: 16,
  DK: 13,
  EE: 13,
  ES: 14,
  FI: 13,
  FR: 15,
  GR: 15,
  HU: 16,
  IE: 16,
  IS: 13,
  IT: 14,
  LI: 16,
  LT: 14,
  LU: 16,
  LV: 13,
  MT: 13,
  NL: 16,
  NO: 13,
  PL: 16,
  PT: 13,
  RO: 16,
  SE: 13,
  SI: 15,
  SK: 16,
};

export interface AgePolicyInput {
  readonly birthDate: string;
  readonly countryCode: string;
  readonly asOf: string | Date;
}

export interface AgePolicyDecision {
  readonly age: number;
  readonly minimumAccountAge: number;
  readonly minimumSocialAge: number;
  readonly accountAllowed: boolean;
  readonly socialAllowed: boolean;
  readonly policyVersion: string;
  readonly reason: string;
}

function parseDateOnly(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RangeError("Birth date must use YYYY-MM-DD.");
  }
  const [year, month, day] = value.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new RangeError("Birth date must use YYYY-MM-DD.");
  }
  const result = new Date(Date.UTC(year, month - 1, day));
  if (
    result.getUTCFullYear() !== year ||
    result.getUTCMonth() !== month - 1 ||
    result.getUTCDate() !== day
  ) {
    throw new RangeError("Birth date is not a real calendar date.");
  }
  return result;
}

function ageOnDate(birthDate: Date, asOf: Date): number {
  let age = asOf.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayPassed =
    asOf.getUTCMonth() > birthDate.getUTCMonth() ||
    (asOf.getUTCMonth() === birthDate.getUTCMonth() &&
      asOf.getUTCDate() >= birthDate.getUTCDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

export function minimumAccountAge(countryCode: string): number {
  const country = countryCode.trim().toUpperCase();
  if (country === "IN") return 18;
  return EEA_DIGITAL_CONSENT_AGES[country] ?? 13;
}

export function evaluateAgePolicy(input: AgePolicyInput): AgePolicyDecision {
  const birthDate = parseDateOnly(input.birthDate);
  const asOf =
    input.asOf instanceof Date
      ? new Date(input.asOf.getTime())
      : parseDateOnly(input.asOf);
  if (Number.isNaN(asOf.getTime()))
    throw new RangeError("Invalid policy date.");
  if (birthDate > asOf)
    throw new RangeError("Birth date cannot be in the future.");

  const age = ageOnDate(birthDate, asOf);
  const accountMinimum = minimumAccountAge(input.countryCode);
  const socialMinimum = Math.max(accountMinimum, 14);
  const accountAllowed = age >= accountMinimum;
  const socialAllowed = accountAllowed && age >= socialMinimum;

  return {
    age,
    minimumAccountAge: accountMinimum,
    minimumSocialAge: socialMinimum,
    accountAllowed,
    socialAllowed,
    policyVersion: AGE_POLICY_VERSION,
    reason: accountAllowed
      ? socialAllowed
        ? "Eligible for an account and social features."
        : `Account eligible; social features unlock at age ${socialMinimum}.`
      : `Accounts require age ${accountMinimum} in the declared country.`,
  };
}
